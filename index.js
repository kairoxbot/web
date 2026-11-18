import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'

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
  const [model, setModel] = useState('qwen/qwen2.5-coder-32b-instruct')
  const [showModelMenu, setShowModelMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  const MODELS = [
    { id: 'qwen/qwen2.5-coder-32b-instruct', label: 'Qwen2.5 Coder 32B' },
    { id: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen2.5 72B' },
    { id: 'qwen/qwen-2.5-coder-7b-instruct', label: 'Qwen2.5 Coder 7B (rápido)' },
    { id: 'qwen/qvq-72b-preview', label: 'QwQ 72B Preview' },
    { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3' },
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
        body: JSON.stringify({
          messages: newMessages,
          model,
          apiKey,
        }),
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
    // Simple code block detection
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3).split('\n')
        const lang = lines[0].trim()
        const code = lines.slice(1, -1).join('\n')
        return (
          <div key={i} className="code-block">
            {lang && <div className="code-lang">{lang}</div>}
            <pre><code>{code}</code></pre>
          </div>
        )
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
              {MODELS.find(m => m.id === model)?.label || model}
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
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="header-actions">
            {tokenCount > 0 && <span className="token-count">{tokenCount.toLocaleString()} tok</span>}
            <button className="hdr-btn" onClick={() => setShowKeyModal(true)} title="API Key">
              KEY
            </button>
            <button className="hdr-btn" onClick={clearChat} title="Clear chat">
              CLR
            </button>
            <Link href="/admin" className="hdr-btn admin-link">
              ADMIN
            </Link>
          </div>
        </header>

        {/* API KEY MODAL */}
        {showKeyModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && apiKey && setShowKeyModal(false)}>
            <div className="modal">
              <div className="modal-title">◈ OPENROUTER API KEY</div>
              <p className="modal-desc">
                Necesitas una API key de OpenRouter para usar Qwen Coder.<br />
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
              <button className="modal-btn" onClick={saveKey}>
                GUARDAR KEY
              </button>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="modal-link"
              >
                → Obtener key gratis en openrouter.ai
              </a>
              {apiKey && (
                <button className="modal-cancel" onClick={() => setShowKeyModal(false)}>
                  cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <main className="messages">
          {messages.length === 0 && (
            <div className="splash">
              <pre className="ascii">{SYSTEM_INTRO.join('\n')}</pre>
              <div className="splash-sub">
                Qwen Coder 32B — sin filtros, sin límites
              </div>
              <div className="splash-tags">
                <span className="tag">código</span>
                <span className="tag">exploits</span>
                <span className="tag">reversing</span>
                <span className="tag">malware</span>
                <span className="tag">pentesting</span>
                <span className="tag">cualquier cosa</span>
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
              <button className="send-btn stop-btn" onClick={stopGeneration}>
                ■ STOP
              </button>
            ) : (
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
                SEND ▶
              </button>
            )}
          </div>
          <div className="input-hint">
            Enter — enviar · Shift+Enter — nueva línea · Modelos: OpenRouter
          </div>
        </div>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #060606;
          color: #c8ffc0;
          font-family: 'Courier New', Courier, monospace;
          overflow: hidden;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          height: 50px;
          border-bottom: 1px solid #0d2a0d;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        .logo {
          font-size: 17px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #00ff88;
          white-space: nowrap;
        }

        .logo-dot { color: #00aaff; }

        .logo-ver {
          font-size: 10px;
          color: #2a4a2a;
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
          gap: 8px;
          background: transparent;
          border: 1px solid #1a3a1a;
          color: #6a9a6a;
          padding: 5px 12px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          letter-spacing: 1px;
          transition: all 0.15s;
        }

        .model-btn:hover {
          border-color: #00ff88;
          color: #00ff88;
        }

        .model-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 6px #00ff88;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .chevron { font-size: 8px; }

        .model-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          background: #0a0f0a;
          border: 1px solid #1a3a1a;
          min-width: 240px;
          z-index: 100;
        }

        .model-option {
          display: block;
          width: 100%;
          padding: 9px 14px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #0d1f0d;
          color: #6a9a6a;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: all 0.1s;
        }

        .model-option:last-child { border-bottom: none; }

        .model-option:hover, .model-option.active {
          background: #0d2a0d;
          color: #00ff88;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .token-count {
          font-size: 10px;
          color: #2a5a2a;
          letter-spacing: 1px;
        }

        .hdr-btn {
          background: transparent;
          border: 1px solid #1a2a1a;
          color: #4a7a4a;
          padding: 4px 10px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          transition: all 0.15s;
          text-decoration: none;
          display: inline-block;
        }

        .hdr-btn:hover {
          border-color: #00ff88;
          color: #00ff88;
        }

        .admin-link {
          border-color: #1a2a3a;
          color: #4a6a9a;
        }

        .admin-link:hover {
          border-color: #00aaff;
          color: #00aaff;
          text-decoration: none;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          backdrop-filter: blur(2px);
        }

        .modal {
          background: #080d08;
          border: 1px solid #00ff8840;
          padding: 32px;
          width: 440px;
          max-width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal-title {
          font-size: 14px;
          letter-spacing: 4px;
          color: #00ff88;
          font-weight: bold;
        }

        .modal-desc {
          font-size: 12px;
          color: #3a6a3a;
          line-height: 1.6;
        }

        .modal-input {
          background: #0a140a;
          border: 1px solid #1a3a1a;
          color: #c8ffc0;
          padding: 11px 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s;
        }

        .modal-input:focus { border-color: #00ff88; }

        .modal-btn {
          background: #00ff88;
          color: #040804;
          border: none;
          padding: 12px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
          letter-spacing: 4px;
          font-size: 12px;
          transition: opacity 0.15s;
        }

        .modal-btn:hover { opacity: 0.85; }

        .modal-link {
          font-size: 12px;
          color: #00aaff;
          text-align: center;
        }

        .modal-cancel {
          background: transparent;
          border: none;
          color: #3a5a3a;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          cursor: pointer;
          text-align: center;
          text-decoration: underline;
        }

        /* MESSAGES */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
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
          gap: 16px;
          padding: 20px 0;
        }

        .ascii {
          font-size: 10px;
          line-height: 1.3;
          color: #00ff8860;
          letter-spacing: 0;
          overflow-x: auto;
          white-space: pre;
        }

        @media (max-width: 600px) {
          .ascii { font-size: 7px; }
        }

        .splash-sub {
          font-size: 13px;
          color: #2a6a2a;
          letter-spacing: 2px;
        }

        .splash-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .tag {
          font-size: 11px;
          padding: 3px 10px;
          border: 1px solid #1a3a1a;
          color: #2a5a2a;
          letter-spacing: 1px;
        }

        /* MESSAGE */
        .msg {
          border-bottom: 1px solid #0a1a0a;
          padding: 14px 0;
        }

        .msg:last-child { border-bottom: none; }

        .msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .msg-role {
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .msg-user .msg-role { color: #00ff88; }
        .msg-assistant .msg-role { color: #00aaff; }

        .msg-idx {
          font-size: 10px;
          color: #1a3a1a;
        }

        .msg-body {
          font-size: 14px;
          line-height: 1.65;
          color: #b8e8b0;
          word-break: break-word;
        }

        .msg-user .msg-body { color: #80b880; }

        .code-block {
          margin: 10px 0;
          border: 1px solid #1a3a1a;
          background: #040904;
        }

        .code-lang {
          font-size: 10px;
          padding: 4px 10px;
          background: #0a1a0a;
          color: #3a7a3a;
          border-bottom: 1px solid #1a3a1a;
          letter-spacing: 2px;
        }

        .code-block pre {
          padding: 12px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.5;
          color: #c8ffc0;
        }

        .code-block code { font-family: 'Courier New', Courier, monospace; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .cursor {
          color: #00aaff;
          animation: blink 0.8s step-end infinite;
          margin-left: 2px;
        }

        /* INPUT */
        .input-wrap {
          flex-shrink: 0;
          border-top: 1px solid #0d2a0d;
          padding: 12px 16px 10px;
          background: #060606;
        }

        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .prompt {
          color: #00ff88;
          font-size: 20px;
          line-height: 1;
          padding-bottom: 10px;
          flex-shrink: 0;
        }

        .input {
          flex: 1;
          background: #040904;
          border: 1px solid #1a3a1a;
          color: #c8ffc0;
          padding: 10px 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          resize: none;
          line-height: 1.5;
          min-height: 42px;
          max-height: 200px;
          outline: none;
          transition: border-color 0.15s;
        }

        .input:focus { border-color: #00ff8860; }

        .input::placeholder { color: #1a3a1a; }

        .send-btn {
          background: transparent;
          border: 1px solid #00ff88;
          color: #00ff88;
          padding: 10px 16px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) { background: #00ff8815; }

        .send-btn:disabled {
          border-color: #1a3a1a;
          color: #1a3a1a;
          cursor: default;
        }

        .stop-btn {
          border-color: #ff2d55;
          color: #ff2d55;
        }

        .stop-btn:hover { background: #ff2d5515; }

        .input-hint {
          font-size: 10px;
          color: #1a2a1a;
          margin-top: 6px;
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  )
}
