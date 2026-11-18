export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  const validUser = process.env.ADMIN_USERNAME || 'admin'
  const validPass = process.env.ADMIN_PASSWORD || 'noobai2024'
  const secret = process.env.ADMIN_SECRET || 'noobai_secret_change_this'

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  if (username === validUser && password === validPass) {
    // Simple token: base64 of secret + timestamp (not cryptographic, good enough for a private tool)
    const payload = `${secret}:${Date.now()}:${username}`
    const token = Buffer.from(payload).toString('base64')
    return res.status(200).json({ success: true, token })
  }

  // Delay to slow brute force
  setTimeout(() => {
    res.status(401).json({ error: 'Invalid credentials' })
  }, 800)
}
