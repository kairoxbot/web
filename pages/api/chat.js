export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, model: reqModel, apiKey: clientKey, systemPrompt } = req.body

  // Use server env key first, then fall back to client-provided key
  const apiKey = process.env.OPENROUTER_API_KEY || clientKey

  if (!apiKey) {
    return res.status(401).json({ error: 'No API key provided. Set OPENROUTER_API_KEY in env or provide via client.' })
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages array' })
  }

  // Prepend system prompt if set
  const finalMessages = systemPrompt?.trim()
    ? [{ role: 'system', content: systemPrompt.trim() }, ...messages]
    : messages

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'NoobAI',
      },
      body: JSON.stringify({
        model: reqModel || 'qwen/qwen-2.5-coder-32b-instruct',
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: `OpenRouter error: ${errText}` })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      res.write(chunk)
      // Flush if possible
      if (res.flush) res.flush()
    }

    res.end()
  } catch (err) {
    console.error('[chat api error]', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    } else {
      res.end()
    }
  }
}
