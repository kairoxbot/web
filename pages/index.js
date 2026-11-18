import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'

// ── LANG DOT COLORS ──────────────────────────────────────────────────────────
const LANG_DOT = {
  javascript: '#f0db4f', js: '#f0db4f',
  typescript: '#3178c6', ts: '#3178c6',
  python: '#3572a5', py: '#3572a5',
  rust: '#dea584',
  go: '#00add8',
  'c++': '#f34b7d', cpp: '#f34b7d',
  c: '#7a7a7a',
  java: '#b07219',
  csharp: '#67af00', cs: '#67af00',
  bash: '#89e051', sh: '#89e051', shell: '#89e051',
  html: '#e34c26',
  css: '#563d7c',
  json: '#cbcb41',
  sql: '#e38c00',
  lua: '#00007c',
  php: '#4f5d95',
  ruby: '#cc342d', rb: '#cc342d',
  swift: '#f05138',
  kotlin: '#7f52ff',
  gdscript: '#478cbf',
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
      .catch(() => {})
  }

  const key = (lang || '').toLowerCase().replace(/\s+/g, '')
  const dotColor = LANG_DOT[key] || '#555'
  const displayLang = lang || 'code'

  return (
    <div style={{
      margin: '14px 0',
      border: '1px solid #252525',
      background: '#070707',
      overflow: 'hidden',
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      {/* ── HEADER BAR ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 13px',
        background: '#111',
        borderBottom: '1px solid #1e1e1e',
      }}>
        {/* left: dot + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{
            width: '9px', height: '9px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            boxShadow: `0 0 7px ${dotColor}80`,
          }} />
          <span style={{
            background: '#fff',
            color: '#000',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '2.5px',
            padding: '3px 9px',
            textTransform: 'uppercase',
            fontFamily: "'Courier New', Courier, monospace",
            lineHeight: 1.4,
            userSelect: 'none',
          }}>
            {displayLang}
          </span>
        </div>
        {/* right: copy button */}
        <button onClick={copy} style={{
          background: 'transparent',
          border: `1px solid ${copied ? '#888' : '#2a2a2a'}`,
          color: copied ? '#ccc' : '#444',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '10px',
          letterSpacing: '1.5px',
          padding: '3px 10px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      {/* ── CODE BODY ── */}
      <pre style={{
        padding: '14px 16px',
        overflowX: 'auto',
        fontSize: '13px',
        lineHeight: 1.6,
        color: '#e8e8e8',
        margin: 0,
      }}>
        <code style={{ fontFamily: "'Courier New', Courier, monospace" }}>{code}</code>
      </pre>
    </div>
  )
}

const SYSTEM_INTRO = [
  '    ███╗   ██╗ ██████╗  ██████╗ ██████╗      █████╗ ██╗',
  '    ████╗  ██║██╔═══██╗██╔═══██╗██╔══██╗    ██╔══██╗██║',
  '    ██╔██╗ ██║██║   ██║██║   ██║██████╔╝    ███████║██║',
  '    ██║╚██╗██║██║   ██║██║   ██║██╔══██╗    ██╔══██║██║',
  '    ██║ ╚████║╚██████╔╝╚██████╔╝██████╔╝    ██║  ██║██║',
  '    ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═════╝     ╚═╝  ╚═╝╚═╝',
]

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [tokenCount, setTokenCount] = useState(0)
  const [model, setModel] = useState('qwen/qwen-2.5-coder-32b-instruct')
  const [showModelMenu, setShowModelMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  // ── FIXED MODEL IDs ──────────────────────────────────────────────────────
  // qwq-32b-preview → qwq-32b (preview suffix removed by OpenRouter)
  // deepseek-chat → deepseek-v3.2 (deepseek-chat deprecated)
  // deepseek-r1 → deepseek-r1-0528:free (free tier, newer build)
  // qwen-2.5-coder-7b-instruct → added :free suffix for free tier
  const MODELS = [
    { id: 'qwen/qwen-2.5-coder-32b-instruct',    label: 'Qwen2.5 Coder 32B' },
    { id: 'qwen/qwen-2.5-72b-instruct',           label: 'Qwen2.5 72B' },
    { id: 'qwen/qwen-2.5-coder-7b-instruct:free', label: 'Qwen2.5 Coder 7B (rápido)' },
    { id: 'qwen/qwq-32b',                         label: 'QwQ 32B' },
    { id: 'deepseek/deepseek-r1-0528:free',       label: 'DeepSeek R1' },
    { id: 'deepseek/deepseek-v3.2',               label: 'DeepSeek V3.2' },
  ]

  useEffect(() => {
    try {
      const stored = localStorage.getItem('noobai_key')
      const storedModel = localStorage.getItem('noobai_model')
      if (stored) setApiKey(stored)
      else setShowKeyModal(true)
      if (storedModel) setModel(storedModel)
    } catch {}
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveKey = () => {
    try { localStorage.setItem('noobai_key', keyInput) } catch {}
    setApiKey(keyInput)
    setShowKeyModal(false)
  }

  const clearChat = () => {
    setMessages([])
    setTokenCount(0)
  }

  const stopGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
      setLoading(false)
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userContent = input.trim()
    const newMessages = [...messages, { role: 'user', content: userContent }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ messages: newMessages, model, apiKey }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: `[ERROR ${res.status}] ${err.error || 'Unknown error'}` }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let content = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              content += delta
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content }
                return updated
              })
            }
            const usage = parsed.usage
            if (usage) setTokenCount(usage.total_tokens || 0)
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            updated[updated.length - 1] = { role: 'assistant', content: `[ERROR] ${err.message}` }
          } else {
            updated.push({ role: 'assistant', content: `[ERROR] ${err.message}` })
          }
          return updated
        })
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, messages, loading, apiKey, model])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const renderContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3).split('\n')
        const lang = lines[0].trim()
        const code = lines.slice(1, -1).join('\n')
        return <CodeBlock key={i} lang={lang} code={code} />
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
    })
  }

  return (
    <>
      <Head>
        <title>NoobAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="layout">
        {/* HEADER */}
        <header className="header">
          <div className="logo">
            NOOB<span className="logo-dot">.</span>AI
            <span className="logo-ver">v2.0</span>
          </div>
          <div className="header-center">
            <button className="model-btn" onClick={() => setShowModelMenu(!showModelMenu)}>
              <span className="model-indicator" />
              <span className="model-label">{MODELS.find(m => m.id === model)?.label || model}</span>
              <span className="chevron">{showModelMenu ? '▲' : '▼'}</span>
            </button>
            {showModelMenu && (
              <div className="model-dropdown">
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    className={`model-option ${model === m.id ? 'active' : ''}`}
                    onClick={() => {
                      setModel(m.id)
                      try { localStorage.setItem('noobai_model', m.id) } catch {}
                      setShowModelMenu(false)
                    }}
                  >
                    <span className="option-label">{m.label}</span>
                    {model === m.id && <span className="option-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="header-actions">
            {tokenCount > 0 && <span className="token-count">{tokenCount.toLocaleString()} tok</span>}
            <button className="hdr-btn" onClick={() => setShowKeyModal(true)} title="API Key">KEY</button>
            <button className="hdr-btn" onClick={clearChat} title="Clear chat">CLR</button>
            <Link href="/admin" className="hdr-btn admin-link">ADMIN</Link>
          </div>
        </header>

        {/* API KEY MODAL */}
        {showKeyModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && apiKey && setShowKeyModal(false)}>
            <div className="modal">
              <div className="modal-title">◈ OPENROUTER API KEY</div>
              <p className="modal-desc">
                Necesitas una API key de OpenRouter.<br />
                La key se guarda solo en tu navegador.
              </p>
              <input
                type="password"
                className="modal-input"
                placeholder="sk-or-v1-..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                autoFocus
              />
              <button className="modal-btn" onClick={saveKey}>GUARDAR KEY</button>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="modal-link">
                → Obtener key gratis en openrouter.ai
              </a>
              {apiKey && (
                <button className="modal-cancel" onClick={() => setShowKeyModal(false)}>cancelar</button>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <main className="messages">
          {messages.length === 0 && (
            <div className="splash">
              <pre className="ascii">{SYSTEM_INTRO.join('\n')}</pre>
              <div className="splash-sub">sin filtros — sin límites</div>
              <div className="splash-tags">
                {['código', 'exploits', 'reversing', 'malware', 'pentesting', 'cualquier cosa'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role}`}>
              <div className="msg-header">
                <span className="msg-role">
                  {msg.role === 'user' ? '▶ TÚ' : '◀ NOOB.AI'}
                </span>
                <span className="msg-idx">#{i + 1}</span>
              </div>
              <div className="msg-body">
                {msg.role === 'assistant'
                  ? renderContent(msg.content)
                  : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                }
                {msg.role === 'assistant' && loading && i === messages.length - 1 && (
                  <span className="cursor">▌</span>
                )}
              </div>
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="msg msg-assistant">
              <div className="msg-header">
                <span className="msg-role">◀ NOOB.AI</span>
              </div>
              <div className="msg-body">
                <span className="cursor">▌</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* INPUT */}
        <div className="input-wrap">
          <div className="input-row">
            <span className="prompt">›</span>
            <textarea
              ref={textareaRef}
              className="input"
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter nueva línea)"
              rows={1}
              disabled={loading && !abortRef.current}
            />
            {loading ? (
              <button className="send-btn stop-btn" onClick={stopGeneration}>■ STOP</button>
            ) : (
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>SEND ▶</button>
            )}
          </div>
          <div className="input-hint">
            Enter — enviar · Shift+Enter — nueva línea · API: OpenRouter
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── BASE ──────────────────────────────────────────────────────── */
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #000;
          color: #fff;
          font-family: 'Courier New', Courier, monospace;
          overflow: hidden;
        }

        /* ── HEADER ────────────────────────────────────────────────────── */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          height: 52px;
          border-bottom: 1px solid #333;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          background: #000;
        }

        .logo {
          font-size: 17px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #fff;
          white-space: nowrap;
        }

        .logo-dot { color: #fff; }

        .logo-ver {
          font-size: 10px;
          color: #444;
          margin-left: 6px;
          letter-spacing: 1px;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          position: relative;
        }

        .model-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid #444;
          color: #ccc;
          padding: 6px 14px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          letter-spacing: 0.5px;
          transition: all 0.15s;
        }

        .model-btn:hover {
          border-color: #fff;
          color: #fff;
        }

        .model-label {
          font-size: 13px;
          font-weight: bold;
        }

        .model-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .chevron { font-size: 9px; color: #666; }

        .model-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          background: #0a0a0a;
          border: 1px solid #444;
          min-width: 260px;
          z-index: 100;
        }

        .model-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 11px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #1a1a1a;
          color: #aaa;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: all 0.1s;
        }

        .model-option:last-child { border-bottom: none; }

        .model-option:hover {
          background: #111;
          color: #fff;
        }

        .model-option.active {
          background: #fff;
          color: #000;
        }

        .model-option.active .option-label {
          font-weight: bold;
        }

        .option-check {
          font-size: 12px;
          font-weight: bold;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .token-count {
          font-size: 11px;
          color: #555;
          letter-spacing: 1px;
        }

        .hdr-btn {
          background: transparent;
          border: 1px solid #333;
          color: #888;
          padding: 5px 11px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          transition: all 0.15s;
          text-decoration: none;
          display: inline-block;
        }

        .hdr-btn:hover {
          border-color: #fff;
          color: #fff;
        }

        .admin-link { color: #666; }

        /* ── MODAL ─────────────────────────────────────────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          backdrop-filter: blur(2px);
        }

        .modal {
          background: #0a0a0a;
          border: 1px solid #444;
          padding: 32px;
          width: 440px;
          max-width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal-title {
          font-size: 15px;
          letter-spacing: 4px;
          color: #fff;
          font-weight: bold;
        }

        .modal-desc {
          font-size: 13px;
          color: #777;
          line-height: 1.6;
        }

        .modal-input {
          background: #111;
          border: 1px solid #333;
          color: #fff;
          padding: 12px 14px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s;
        }

        .modal-input:focus { border-color: #fff; }

        .modal-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 13px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
          letter-spacing: 4px;
          font-size: 13px;
          transition: opacity 0.15s;
        }

        .modal-btn:hover { opacity: 0.85; }

        .modal-link {
          font-size: 12px;
          color: #888;
          text-align: center;
        }

        .modal-link:hover { color: #fff; }

        .modal-cancel {
          background: transparent;
          border: none;
          color: #555;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          cursor: pointer;
          text-align: center;
          text-decoration: underline;
        }

        /* ── MESSAGES ──────────────────────────────────────────────────── */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .splash {
          margin: auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          padding: 20px 0;
        }

        .ascii {
          font-size: 10px;
          line-height: 1.3;
          color: #444;
          letter-spacing: 0;
          overflow-x: auto;
          white-space: pre;
        }

        @media (max-width: 600px) {
          .ascii { font-size: 7px; }
        }

        .splash-sub {
          font-size: 13px;
          color: #555;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .splash-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .tag {
          font-size: 12px;
          padding: 4px 11px;
          border: 1px solid #2a2a2a;
          color: #555;
          letter-spacing: 1px;
        }

        /* ── SINGLE MESSAGE ────────────────────────────────────────────── */
        .msg {
          border-bottom: 1px solid #111;
          padding: 16px 0;
        }

        .msg:last-child { border-bottom: none; }

        .msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .msg-role {
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .msg-user .msg-role   { color: #fff; }
        .msg-assistant .msg-role { color: #aaa; }

        .msg-idx {
          font-size: 11px;
          color: #2a2a2a;
        }

        .msg-body {
          font-size: 15px;
          line-height: 1.7;
          color: #ddd;
          word-break: break-word;
        }

        .msg-user .msg-body { color: #fff; }

        /* code blocks → handled by <CodeBlock /> inline styles */

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .cursor {
          color: #fff;
          animation: blink 0.8s step-end infinite;
          margin-left: 2px;
        }

        /* ── INPUT ─────────────────────────────────────────────────────── */
        .input-wrap {
          flex-shrink: 0;
          border-top: 1px solid #222;
          padding: 12px 20px 10px;
          background: #000;
        }

        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }

        .prompt {
          color: #fff;
          font-size: 22px;
          line-height: 1;
          padding-bottom: 10px;
          flex-shrink: 0;
        }

        .input {
          flex: 1;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          color: #fff;
          padding: 10px 14px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 15px;
          resize: none;
          line-height: 1.5;
          min-height: 44px;
          max-height: 200px;
          outline: none;
          transition: border-color 0.15s;
        }

        .input:focus { border-color: #666; }

        .input::placeholder { color: #333; }

        .send-btn {
          background: transparent;
          border: 1px solid #fff;
          color: #fff;
          padding: 10px 18px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          letter-spacing: 2px;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: #fff;
          color: #000;
        }

        .send-btn:disabled {
          border-color: #222;
          color: #333;
          cursor: default;
        }

        .stop-btn {
          border-color: #fff;
          color: #fff;
        }

        .stop-btn:hover {
          background: #fff;
          color: #000;
        }

        .input-hint {
          font-size: 11px;
          color: #333;
          margin-top: 7px;
          letter-spacing: 0.5px;
        }

        /* ── SCROLLBAR ─────────────────────────────────────────────────── */
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: #000; }
        .messages::-webkit-scrollbar-thumb { background: #222; }
        .messages::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </>
  )
}
