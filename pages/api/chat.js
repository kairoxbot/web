// lang: JavaScript, file: pages/api/chat.js
// target: Vercel/Next.js, Node 18+
// routes: OpenRouter (qwen/deepseek) + Google Gemini direct API
// security: rate limiting, input validation, security headers

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
}

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Vercel is stateless per invocation, so this only limits within a single warm
// lambda. Good enough to blunt burst abuse; pair with Vercel's built-in DDoS.
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute
const RATE_LIMIT_MAX       = 20      // requests per window per IP
const ipMap = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = ipMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1; entry.start = now
  } else {
    entry.count++
  }
  ipMap.set(ip, entry)
  // Prune old entries every ~100 calls to avoid unbounded growth
  if (ipMap.size > 500) {
    for (const [k, v] of ipMap) {
      if (now - v.start > RATE_LIMIT_WINDOW_MS * 2) ipMap.delete(k)
    }
  }
  return entry.count > RATE_LIMIT_MAX
}

// ── Security headers ──────────────────────────────────────────────────────────
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

// ── Gemini model routing ──────────────────────────────────────────────────────
const GEMINI_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
])

function isGemini(model) {
  return model && GEMINI_MODELS.has(model)
}

// Convert OpenAI-style messages to Gemini's "contents" format
function toGeminiContents(messages) {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
}

function extractSystemPrompt(messages) {
  const sys = messages.find(m => m.role === 'system')
  return sys ? sys.content : null
}

// ── Gemini streaming handler ──────────────────────────────────────────────────
async function handleGemini(req, res, { model, messages, geminiKey }) {
  const key = process.env.GEMINI_API_KEY || geminiKey
  if (!key) {
    return res.status(401).json({ error: 'No Gemini API key. Set GEMINI_API_KEY in env or provide via client.' })
  }

  const contents = toGeminiContents(messages)
  if (!contents.length) {
    return res.status(400).json({ error: 'No valid messages for Gemini.' })
  }

  const systemText = extractSystemPrompt(messages)
  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  }
  if (systemText) {
    body.systemInstruction = { parts: [{ text: systemText }] }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return res.status(upstream.status).json({ error: `Gemini error: ${errText}` })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') continue
      try {
        const parsed = JSON.parse(raw)
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          // Re-emit as OpenAI-compatible SSE so the frontend doesn't need to change
          const chunk = {
            choices: [{ delta: { content: text }, index: 0, finish_reason: null }],
          }
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
          if (res.flush) res.flush()
        }
        // Emit finish
        const reason = parsed.candidates?.[0]?.finishReason
        if (reason && reason !== 'STOP') {
          const fin = { choices: [{ delta: {}, index: 0, finish_reason: reason.toLowerCase() }] }
          res.write(`data: ${JSON.stringify(fin)}\n\n`)
        }
      } catch {}
    }
  }

  res.write('data: [DONE]\n\n')
  res.end()
}

// ── OpenRouter streaming handler ──────────────────────────────────────────────
async function handleOpenRouter(req, res, { model, messages, apiKey, systemPrompt }) {
  const key = process.env.OPENROUTER_API_KEY || apiKey
  if (!key) {
    return res.status(401).json({ error: 'No API key. Set OPENROUTER_API_KEY in env or provide via client.' })
  }

  const finalMessages = systemPrompt?.trim()
    ? [{ role: 'system', content: systemPrompt.trim() }, ...messages]
    : messages

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
      'X-Title': 'BlackholeAI',
    },
    body: JSON.stringify({
      model: model || 'qwen/qwen-2.5-coder-32b-instruct',
      messages: finalMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 8192,
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return res.status(upstream.status).json({ error: `OpenRouter error: ${errText}` })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    res.write(chunk)
    if (res.flush) res.flush()
  }

  res.end()
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setSecurityHeaders(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit by IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Slow down.' })
  }

  const { messages, model, apiKey: clientKey, geminiKey: clientGeminiKey, systemPrompt } = req.body

  // Input validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages array.' })
  }
  if (messages.length > 100) {
    return res.status(400).json({ error: 'Too many messages (max 100).' })
  }
  for (const m of messages) {
    if (!m.role || !m.content || typeof m.content !== 'string') {
      return res.status(400).json({ error: 'Malformed message object.' })
    }
    if (m.content.length > 32_000) {
      return res.status(400).json({ error: 'Message too long (max 32k chars).' })
    }
  }
  if (typeof model !== 'string' || model.length > 128) {
    return res.status(400).json({ error: 'Invalid model identifier.' })
  }

  try {
    if (isGemini(model)) {
      await handleGemini(req, res, {
        model,
        messages,
        geminiKey: clientGeminiKey,
      })
    } else {
      await handleOpenRouter(req, res, {
        model,
        messages,
        apiKey: clientKey,
        systemPrompt,
      })
    }
  } catch (err) {
    console.error('[chat api error]', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    } else {
      res.end()
    }
  }
}
