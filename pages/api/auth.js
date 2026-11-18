// lang: JavaScript, file: pages/api/auth.js
// target: Vercel/Next.js, Node 18+
// security: HMAC-SHA256 token, brute-force rate limiting, timing-safe compare

import crypto from 'crypto'

// ── Rate limiter — brute-force protection ──────────────────────────────────────
const ATTEMPTS_WINDOW_MS = 15 * 60_000  // 15-minute window
const MAX_ATTEMPTS       = 10           // lock after 10 fails per IP
const failMap = new Map()

function checkBruteForce(ip) {
  const now = Date.now()
  const entry = failMap.get(ip) || { count: 0, start: now, locked: false }
  if (now - entry.start > ATTEMPTS_WINDOW_MS) {
    // Reset window
    failMap.set(ip, { count: 0, start: now, locked: false })
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(ip) {
  const now = Date.now()
  const entry = failMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > ATTEMPTS_WINDOW_MS) {
    failMap.set(ip, { count: 1, start: now })
  } else {
    entry.count++
    failMap.set(ip, entry)
  }
}

function recordSuccess(ip) {
  failMap.delete(ip)
}

// ── HMAC-SHA256 token (stateless, verifiable) ──────────────────────────────────
function generateToken(secret, username) {
  const payload = JSON.stringify({ u: username, ts: Date.now(), r: crypto.randomBytes(8).toString('hex') })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${sig}`
}

export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url')
  // Timing-safe compare
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    // 24-hour expiry
    if (Date.now() - payload.ts > 24 * 60 * 60_000) return null
    return payload
  } catch { return null }
}

// ── Timing-safe credential compare ────────────────────────────────────────────
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  // Pad to same length to avoid length leaks
  const len = Math.max(a.length, b.length)
  const ab = Buffer.alloc(len, 0); ab.write(a)
  const bb = Buffer.alloc(len, 0); bb.write(b)
  return crypto.timingSafeEqual(ab, bb) && a.length === b.length
}

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'

  if (checkBruteForce(ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again later.' })
  }

  const { username, password } = req.body || {}

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password required.' })
  }

  if (username.length > 64 || password.length > 128) {
    return res.status(400).json({ error: 'Invalid credentials.' })
  }

  const validUser   = process.env.ADMIN_USERNAME || 'admin'
  const validPass   = process.env.ADMIN_PASSWORD || 'blackhole2024'
  const secret      = process.env.ADMIN_SECRET   || 'blackhole_secret_change_this_min_32_chars'

  const userOk = safeCompare(username, validUser)
  const passOk = safeCompare(password, validPass)

  if (userOk && passOk) {
    recordSuccess(ip)
    const token = generateToken(secret, username)
    return res.status(200).json({ success: true, token })
  }

  recordFailure(ip)
  // Always wait a fixed delay to blunt timing attacks and brute force
  return new Promise(resolve => setTimeout(() => {
    res.status(401).json({ error: 'Invalid credentials.' })
    resolve()
  }, 600 + Math.random() * 400))
}
