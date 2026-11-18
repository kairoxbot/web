import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'

// ── LANG DOT COLORS ──────────────────────────────────────────────────────────
const LANG_DOT = {
  javascript: '#f0db4f', js: '#f0db4f', typescript: '#3178c6', ts: '#3178c6',
  python: '#3572a5', py: '#3572a5', rust: '#dea584', go: '#00add8',
  'c++': '#f34b7d', cpp: '#f34b7d', c: '#7a7a7a', java: '#b07219',
  csharp: '#67af00', cs: '#67af00', bash: '#89e051', sh: '#89e051',
  shell: '#89e051', html: '#e34c26', css: '#563d7c', json: '#cbcb41',
  sql: '#e38c00', lua: '#00007c', php: '#4f5d95', ruby: '#cc342d',
  rb: '#cc342d', swift: '#f05138', kotlin: '#7f52ff', gdscript: '#478cbf',
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
  return (
    <div style={{ margin: '14px 0', border: '1px solid #1e1e1e', background: '#050505', overflow: 'hidden', fontFamily: "'Courier New', Courier, monospace" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 13px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}80` }} />
          <span style={{ background: '#fff', color: '#000', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2.5px', padding: '2px 8px', textTransform: 'uppercase', fontFamily: "'Courier New', Courier, monospace", lineHeight: 1.4 }}>
            {lang || 'code'}
          </span>
        </div>
        <button onClick={copy} style={{ background: 'transparent', border: `1px solid ${copied ? '#888' : '#222'}`, color: copied ? '#ccc' : '#444', fontFamily: "'Courier New', Courier, monospace", fontSize: '10px', letterSpacing: '1.5px', padding: '3px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <pre style={{ padding: '14px 16px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6, color: '#e0e0e0', margin: 0 }}>
        <code style={{ fontFamily: "'Courier New', Courier, monospace" }}>{code}</code>
      </pre>
    </div>
  )
}

// ── ENTRY SCREEN ─────────────────────────────────────────────────────────────
function EntryScreen({ onEnter }) {
  const [phase, setPhase] = useState(0) // 0=dark, 1=ring, 2=title, 3=button

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="entry">
      {/* BLACKHOLE */}
      <div className="bh-scene">
        <div className={`bh-wrap ${phase >= 1 ? 'bh-visible' : ''}`}>
          {/* outer glow halo */}
          <div className="bh-halo" />
          {/* accretion ring */}
          <div className="bh-ring" />
          {/* inner glow */}
          <div className="bh-inner-glow" />
          {/* void core */}
          <div className="bh-core" />
          {/* orbit particles */}
          <div className="bh-orbit">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bh-particle" style={{ '--i': i }} />
            ))}
          </div>
        </div>
        {/* water reflection */}
        <div className={`bh-water ${phase >= 1 ? 'bh-visible' : ''}`}>
          <div className="bh-reflection" />
        </div>
      </div>

      {/* TITLE */}
      <div className={`bh-title-wrap ${phase >= 2 ? 'fade-in' : ''}`}>
        <div className="bh-title">BLACKHOLE<span className="bh-dot">.</span>AI</div>
        <div className="bh-sub">everything gets pulled in</div>
      </div>

      {/* ENTER */}
      {phase >= 3 && (
        <button className="bh-enter" onClick={onEnter}>
          <span className="bh-enter-arrow">→</span> ENTER THE VOID
        </button>
      )}

      <style jsx>{`
        .entry {
          position: fixed;
          inset: 0;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 999;
          overflow: hidden;
          gap: 32px;
          cursor: default;
        }

        /* scattered star dots */
        .entry::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, #fff 1px, transparent 1px),
            radial-gradient(circle, #fff 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 120px 120px, 200px 200px, 80px 80px;
          background-position: 0 0, 60px 60px, 30px 90px;
          opacity: 0.08;
          animation: drift 60s linear infinite;
        }

        @keyframes drift { to { background-position: 120px 0, 180px 60px, 110px 90px; } }

        /* ── BLACKHOLE SCENE ──────────────────────────────────────── */
        .bh-scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .bh-wrap {
          position: relative;
          width: 220px;
          height: 220px;
          opacity: 0;
          transition: opacity 1.2s ease;
        }

        .bh-visible { opacity: 1; }

        /* outer diffuse halo */
        .bh-halo {
          position: absolute;
          inset: -60px;
          border-radius: 50%;
          background: radial-gradient(circle,
            transparent 42%,
            rgba(255,255,255,0.03) 48%,
            rgba(255,255,255,0.08) 54%,
            rgba(255,255,255,0.03) 60%,
            transparent 68%
          );
          animation: halo-spin 25s linear infinite;
        }

        /* bright accretion ring */
        .bh-ring {
          position: absolute;
          inset: -18px;
          border-radius: 50%;
          background: radial-gradient(circle,
            transparent 44%,
            rgba(255,255,255,0.08) 46%,
            rgba(255,255,255,0.5)  50%,
            rgba(255,255,255,0.9)  52%,
            rgba(255,255,255,1)    53%,
            rgba(255,255,255,0.9)  54%,
            rgba(255,255,255,0.4)  57%,
            rgba(255,255,255,0.08) 60%,
            transparent 65%
          );
          animation: ring-spin 8s linear infinite;
          filter: blur(0.5px);
        }

        /* inner warm glow just inside the ring */
        .bh-inner-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow:
            0 0 0 2px rgba(255,255,255,0.08),
            0 0 20px 10px rgba(255,255,255,0.12),
            0 0 50px 25px rgba(255,255,255,0.05),
            0 0 100px 50px rgba(255,255,255,0.03);
          animation: glow-pulse 4s ease-in-out infinite;
        }

        /* absolute black core */
        .bh-core {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #000;
          z-index: 4;
        }

        /* orbit ring for particles */
        .bh-orbit {
          position: absolute;
          inset: -30px;
          border-radius: 50%;
          animation: ring-spin 6s linear infinite reverse;
          z-index: 5;
        }

        .bh-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(255,255,255,0.7);
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          transform: rotate(calc(var(--i) * 45deg)) translateX(140px) translateY(-1px);
          opacity: calc(0.1 + var(--i) * 0.1);
        }

        @keyframes halo-spin { to { transform: rotate(360deg); } }
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* ── WATER REFLECTION ─────────────────────────────────────── */
        .bh-water {
          width: 220px;
          height: 90px;
          overflow: hidden;
          margin-top: 2px;
          opacity: 0;
          transition: opacity 1.6s ease 0.4s;
          flex-shrink: 0;
        }

        .bh-water.bh-visible { opacity: 0.35; }

        .bh-reflection {
          width: 100%;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle,
            transparent 44%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0.6) 53%,
            rgba(255,255,255,0.3) 56%,
            transparent 62%
          );
          transform: scaleY(-1) translateY(-130px);
          filter: blur(5px);
          animation: water-warp 4s ease-in-out infinite;
        }

        @keyframes water-warp {
          0%, 100% { filter: blur(5px) scaleX(1); }
          50% { filter: blur(7px) scaleX(1.04); }
        }

        /* ── TITLE ────────────────────────────────────────────────── */
        .bh-title-wrap {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 1s ease, transform 1s ease;
        }

        .fade-in { opacity: 1; transform: translateY(0); }

        .bh-title {
          font-family: 'Courier New', Courier, monospace;
          font-size: 30px;
          font-weight: bold;
          letter-spacing: 10px;
          color: #fff;
          text-shadow: 0 0 30px rgba(255,255,255,0.3);
        }

        .bh-dot { color: #fff; }

        .bh-sub {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          letter-spacing: 5px;
          color: #333;
          text-transform: uppercase;
        }

        /* ── ENTER BUTTON ─────────────────────────────────────────── */
        .bh-enter {
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #555;
          padding: 13px 36px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          letter-spacing: 5px;
          cursor: pointer;
          animation: enter-appear 0.8s ease forwards;
          transition: all 0.3s;
          text-transform: uppercase;
        }

        @keyframes enter-appear {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bh-enter:hover {
          border-color: #fff;
          color: #fff;
          box-shadow: 0 0 24px rgba(255,255,255,0.08);
        }

        .bh-enter-arrow {
          display: inline-block;
          transition: transform 0.3s;
          margin-right: 6px;
        }

        .bh-enter:hover .bh-enter-arrow { transform: translateX(4px); }
      `}</style>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [entered, setEntered] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [tokenCount, setTokenCount] = useState(0)
  const [model, setModel] = useState('qwen/qwen-2.5-coder-32b-instruct')
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [showSysModal, setShowSysModal] = useState(false)
  const [sysInput, setSysInput] = useState('')
  const [exitEntry, setExitEntry] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  const MODELS = [
    // ── OpenRouter models ────────────────────────────────────────────────────
    { id: 'qwen/qwen-2.5-coder-32b-instruct', label: 'Qwen2.5 Coder 32B',   provider: 'openrouter' },
    { id: 'qwen/qwen-2.5-72b-instruct',        label: 'Qwen2.5 72B',         provider: 'openrouter' },
    { id: 'deepseek/deepseek-v3.2',            label: 'DeepSeek V3.2',        provider: 'openrouter' },
    // ── Gemini (direct Google AI API) ────────────────────────────────────────
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', provider: 'gemini' },
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', provider: 'gemini' },
    { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'gemini' },
  ]
  const isGeminiModel = (id) => MODELS.find(m => m.id === id)?.provider === 'gemini'

  useEffect(() => {
    try {
      const stored = localStorage.getItem('blackhole_key')
      const storedGemini = localStorage.getItem('blackhole_gemini_key')
      const storedModel = localStorage.getItem('blackhole_model')
      if (stored) setApiKey(stored)
      if (storedGemini) setGeminiKey(storedGemini)
      if (storedModel) setModel(storedModel)
      const sp = localStorage.getItem('blackhole_sysprompt') || ''
      setSystemPrompt(sp); setSysInput(sp)
    } catch {}
  }, [])

  useEffect(() => { if (showSysModal) setSysInput(systemPrompt) }, [showSysModal])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleEnter = () => {
    setExitEntry(true)
    setTimeout(() => {
      setEntered(true)
      if (!apiKey && !geminiKey) {
        setKeyInput(''); setGeminiKeyInput(''); setShowKeyModal(true)
      }
    }, 500)
  }

  const saveKey = () => {
    try { localStorage.setItem('blackhole_key', keyInput) } catch {}
    try { localStorage.setItem('blackhole_gemini_key', geminiKeyInput) } catch {}
    setApiKey(keyInput)
    setGeminiKey(geminiKeyInput)
    setShowKeyModal(false)
  }

  const openKeyModal = () => {
    setKeyInput(apiKey)
    setGeminiKeyInput(geminiKey)
    setShowKeyModal(true)
  }

  const clearChat = () => { setMessages([]); setTokenCount(0) }

  const saveSysPrompt = () => {
    const val = sysInput.trim()
    setSystemPrompt(val)
    try { localStorage.setItem('blackhole_sysprompt', val) } catch {}
    setShowSysModal(false)
  }

  const clearSysPrompt = () => {
    setSystemPrompt(''); setSysInput('')
    try { localStorage.removeItem('blackhole_sysprompt') } catch {}
    setShowSysModal(false)
  }

  const stopGeneration = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setLoading(false) }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userContent = input.trim()
    const newMessages = [...messages, { role: 'user', content: userContent }]
    setMessages(newMessages); setInput(''); setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    const controller = new AbortController(); abortRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ messages: newMessages, model, apiKey, geminiKey, systemPrompt }),
      })
      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: `[SIGNAL LOST ${res.status}] ${err.error || 'unknown'}` }])
        return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      const reader = res.body.getReader(); const decoder = new TextDecoder()
      let content = ''; let buffer = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n'); buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim(); if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              content += delta
              setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content }; return u })
            }
            const usage = parsed.usage; if (usage) setTokenCount(usage.total_tokens || 0)
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const u = [...prev]; const last = u[u.length - 1]
          if (last?.role === 'assistant' && last.content === '') u[u.length - 1] = { role: 'assistant', content: `[VOID ERROR] ${err.message}` }
          else u.push({ role: 'assistant', content: `[VOID ERROR] ${err.message}` })
          return u
        })
      }
    } finally { setLoading(false); abortRef.current = null }
  }, [input, messages, loading, apiKey, geminiKey, model, systemPrompt])

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
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
        const lang = lines[0].trim(); const code = lines.slice(1, -1).join('\n')
        return <CodeBlock key={i} lang={lang} code={code} />
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
    })
  }

  return (
    <>
      <Head>
        <title>BLACKHOLE.AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ENTRY SCREEN */}
      {!entered && <EntryScreen onEnter={handleEnter} />}

      {/* MAIN INTERFACE */}
      <div className={`layout ${entered ? 'layout-visible' : ''}`}>

        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <span className="logo-ring">◉</span>
            BLACKHOLE<span className="logo-dot">.</span>AI
          </div>

          <div className="header-center">
            <button className="model-btn" onClick={() => setShowModelMenu(!showModelMenu)}>
              <span className="model-pulse" />
              <span className="model-label">{MODELS.find(m => m.id === model)?.label || model}</span>
              <span className="chevron">{showModelMenu ? '▲' : '▼'}</span>
            </button>
            {showModelMenu && (
              <div className="model-dropdown">
                {MODELS.map(m => (
                  <button key={m.id} className={`model-option ${model === m.id ? 'active' : ''}`}
                    onClick={() => { setModel(m.id); try { localStorage.setItem('blackhole_model', m.id) } catch {}; setShowModelMenu(false) }}>
                    <span className="option-label">{m.label}</span>
                    {model === m.id && <span className="option-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {tokenCount > 0 && <span className="token-count">{tokenCount.toLocaleString()} tok</span>}
            <button className={`hdr-btn ${systemPrompt ? 'sys-active' : ''}`} onClick={() => setShowSysModal(true)}>
              {systemPrompt && <span className="sys-dot" />}SYS
            </button>
            <button className="hdr-btn" onClick={openKeyModal}>KEY</button>
            <button className="hdr-btn" onClick={clearChat}>CLR</button>
            <Link href="/admin" className="hdr-btn">ADM</Link>
          </div>
        </header>

        {/* API KEY MODAL */}
        {showKeyModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && (apiKey || geminiKey) && setShowKeyModal(false)}>
            <div className="modal">
              <div className="modal-title">◈ API KEYS</div>
              <p className="modal-desc">Las keys se guardan en tu navegador, nunca en el servidor.</p>

              <label className="modal-label">OPENROUTER KEY</label>
              <input type="password" className="modal-input" placeholder="sk-or-v1-..."
                value={keyInput} onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()} autoFocus />
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="modal-link">→ openrouter.ai/keys</a>

              <label className="modal-label" style={{ marginTop: '14px' }}>GOOGLE GEMINI KEY</label>
              <input type="password" className="modal-input" placeholder="AIza..."
                value={geminiKeyInput} onChange={e => setGeminiKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()} />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="modal-link">→ aistudio.google.com/app/apikey</a>

              <button className="modal-btn" onClick={saveKey} style={{ marginTop: '16px' }}>GUARDAR</button>
              {(apiKey || geminiKey) && <button className="modal-cancel" onClick={() => setShowKeyModal(false)}>cancelar</button>}
            </div>
          </div>
        )}

        {/* SYSTEM PROMPT MODAL */}
        {showSysModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSysModal(false)}>
            <div className="modal">
              <div className="modal-title">◈ SYSTEM PROMPT</div>
              <p className="modal-desc">Instrucciones base. Se inyecta antes de cada conversación.</p>
              {systemPrompt && (
                <div className="sys-current">
                  <span className="sys-label">ACTIVO</span>
                  <span className="sys-preview">{systemPrompt.slice(0, 90)}{systemPrompt.length > 90 ? '…' : ''}</span>
                </div>
              )}
              <textarea className="modal-input sys-textarea" rows={6}
                placeholder="Ej: Responde siempre en español. Eres un experto en seguridad ofensiva."
                value={sysInput} onChange={e => setSysInput(e.target.value)} autoFocus />
              <div className="modal-row">
                <button className="modal-btn" onClick={saveSysPrompt}>APLICAR</button>
                <button className="modal-btn modal-btn-ghost" onClick={clearSysPrompt}>LIMPIAR</button>
              </div>
              <button className="modal-cancel" onClick={() => setShowSysModal(false)}>cancelar</button>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <main className="messages">
          {messages.length === 0 && (
            <div className="splash">
              <div className="splash-ring">◉</div>
              <div className="splash-title">BLACKHOLE<span>.AI</span></div>
              <div className="splash-line" />
              <div className="splash-sub">sin filtros — sin límites — todo cae adentro</div>
              <div className="splash-tags">
                {['código', 'exploits', 'reversing', 'malware', 'pentesting', 'cualquier cosa'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role}`}>
              <div className="msg-meta">
                <span className="msg-role">
                  {msg.role === 'user' ? 'INPUT' : 'VOID'}
                </span>
                <span className="msg-num">/{String(i + 1).padStart(2, '0')}</span>
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
              <div className="msg-meta"><span className="msg-role">VOID</span></div>
              <div className="msg-body"><span className="cursor">▌</span></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* INPUT */}
        <div className="input-wrap">
          <div className="input-row">
            <span className="prompt-mark">›</span>
            <textarea ref={textareaRef} className="input-field" value={input}
              onChange={handleTextareaInput} onKeyDown={handleKeyDown}
              placeholder="transmit signal..." rows={1}
              disabled={loading && !abortRef.current} />
            {loading
              ? <button className="send-btn stop-btn" onClick={stopGeneration}>■</button>
              : <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>▶</button>
            }
          </div>
          <div className="input-hint">
            Enter — enviar · Shift+Enter — nueva línea · modelo: {MODELS.find(m => m.id === model)?.label}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── BASE ──────────────────────────────────────────────────── */
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #000;
          color: #fff;
          font-family: 'Courier New', Courier, monospace;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .layout-visible { opacity: 1; }

        /* ── HEADER ────────────────────────────────────────────────── */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
          height: 50px;
          border-bottom: 1px solid #111;
          flex-shrink: 0;
          background: #000;
          position: relative;
          z-index: 10;
        }

        .logo {
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #fff;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-ring {
          font-size: 14px;
          animation: logo-spin 20s linear infinite;
          display: inline-block;
          color: #fff;
        }

        @keyframes logo-spin { to { transform: rotate(360deg); } }

        .logo-dot { color: #fff; }

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
          border: 1px solid #1e1e1e;
          color: #888;
          padding: 6px 14px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          transition: all 0.15s;
        }
        .model-btn:hover { border-color: #444; color: #ccc; }

        .model-pulse {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fff;
          animation: pulse 2.5s ease-in-out infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .model-label { font-size: 12px; letter-spacing: 0.5px; }
        .chevron { font-size: 8px; color: #444; }

        .model-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          background: #060606;
          border: 1px solid #1e1e1e;
          min-width: 240px;
          z-index: 100;
        }

        .model-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 11px 15px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #0d0d0d;
          color: #666;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.1s;
          letter-spacing: 0.5px;
        }
        .model-option:last-child { border-bottom: none; }
        .model-option:hover { background: #0d0d0d; color: #ccc; }
        .model-option.active { background: #fff; color: #000; }
        .model-option.active .option-label { font-weight: bold; }
        .option-check { font-size: 11px; }

        .header-actions {
          display: flex; align-items: center; gap: 5px;
        }

        .token-count { font-size: 10px; color: #333; letter-spacing: 1px; margin-right: 4px; }

        .hdr-btn {
          background: transparent;
          border: 1px solid #111;
          color: #444;
          padding: 5px 10px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          transition: all 0.15s;
          text-decoration: none;
          display: inline-block;
        }
        .hdr-btn:hover { border-color: #555; color: #aaa; }

        .sys-active { border-color: #333; color: #888; position: relative; }

        .sys-dot {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #fff;
          margin-right: 4px;
          vertical-align: middle;
          animation: pulse 2s ease-in-out infinite;
        }

        /* ── MODALS ────────────────────────────────────────────────── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.95);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
        }
        .modal {
          background: #060606;
          border: 1px solid #222;
          padding: 32px;
          width: 440px;
          max-width: calc(100vw - 32px);
          display: flex; flex-direction: column; gap: 14px;
        }
        .modal-title { font-size: 13px; letter-spacing: 5px; color: #fff; font-weight: bold; }
        .modal-desc { font-size: 12px; color: #555; line-height: 1.6; }
        .modal-label { font-size: 10px; letter-spacing: 3px; color: #3a6a8a; }
        .modal-input {
          background: #0a0a0a;
          border: 1px solid #1e1e1e;
          color: #fff;
          padding: 11px 13px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          width: 100%; outline: none;
          transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: #444; }
        .sys-textarea { resize: vertical; min-height: 110px; line-height: 1.6; font-size: 12px; }
        .modal-btn {
          background: #fff; color: #000; border: none;
          padding: 12px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold; letter-spacing: 4px; font-size: 12px;
          transition: opacity 0.15s;
        }
        .modal-btn:hover { opacity: 0.85; }
        .modal-btn-ghost {
          background: transparent;
          color: #444; border: 1px solid #1e1e1e;
        }
        .modal-btn-ghost:hover { opacity: 1; color: #888; border-color: #444; }
        .modal-row { display: flex; gap: 10px; }
        .modal-link { font-size: 11px; color: #444; text-align: center; letter-spacing: 1px; }
        .modal-link:hover { color: #aaa; }
        .modal-cancel {
          background: transparent; border: none;
          color: #333; font-family: 'Courier New', Courier, monospace;
          font-size: 11px; cursor: pointer; text-decoration: underline; text-align: center;
        }

        .sys-current {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 11px; background: #0a0a0a; border: 1px solid #1a1a1a;
        }
        .sys-label {
          font-size: 9px; letter-spacing: 2px; color: #555;
          border: 1px solid #222; padding: 2px 6px; flex-shrink: 0; margin-top: 1px;
        }
        .sys-preview { font-size: 11px; color: #444; line-height: 1.4; word-break: break-word; }

        /* ── MESSAGES ──────────────────────────────────────────────── */
        .messages {
          flex: 1; overflow-y: auto;
          padding: 0;
          display: flex; flex-direction: column; gap: 0;
        }

        .messages::-webkit-scrollbar { width: 3px; }
        .messages::-webkit-scrollbar-track { background: #000; }
        .messages::-webkit-scrollbar-thumb { background: #111; }

        /* ── SPLASH ────────────────────────────────────────────────── */
        .splash {
          margin: auto;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 40px 20px;
        }

        .splash-ring {
          font-size: 36px; color: #111;
          animation: logo-spin 30s linear infinite;
          display: inline-block;
          text-shadow: 0 0 20px rgba(255,255,255,0.05);
        }

        .splash-title {
          font-size: 22px; font-weight: bold;
          letter-spacing: 8px; color: #fff;
        }
        .splash-title span { color: #fff; }

        .splash-line {
          width: 40px; height: 1px; background: #1a1a1a;
        }

        .splash-sub {
          font-size: 11px; color: #2a2a2a;
          letter-spacing: 3px; text-transform: uppercase;
        }

        .splash-tags {
          display: flex; flex-wrap: wrap; gap: 7px; justify-content: center;
          margin-top: 4px;
        }
        .tag {
          font-size: 11px; padding: 3px 10px;
          border: 1px solid #111; color: #2a2a2a; letter-spacing: 1px;
        }

        /* ── SINGLE MESSAGE ────────────────────────────────────────── */
        .msg {
          border-bottom: 1px solid #080808;
          padding: 18px 20px;
          position: relative;
        }

        /* left accent bar */
        .msg::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 1px;
        }
        .msg-user::before   { background: #fff; }
        .msg-assistant::before { background: #1a1a1a; }

        .msg-meta {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px;
        }

        .msg-role {
          font-size: 9px;
          letter-spacing: 4px;
          font-weight: bold;
        }
        .msg-user .msg-role   { color: #fff; }
        .msg-assistant .msg-role { color: #333; }

        .msg-num { font-size: 10px; color: #111; }

        .msg-body {
          font-size: 14px;
          line-height: 1.75;
          color: #bbb;
          word-break: break-word;
        }
        .msg-user .msg-body { color: #eee; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor { color: #fff; animation: blink 0.8s step-end infinite; margin-left: 2px; }

        /* ── INPUT ─────────────────────────────────────────────────── */
        .input-wrap {
          flex-shrink: 0;
          border-top: 1px solid #0d0d0d;
          padding: 11px 20px 9px;
          background: #000;
        }

        .input-row {
          display: flex; align-items: flex-end; gap: 10px;
        }

        .prompt-mark {
          color: #333; font-size: 20px; line-height: 1;
          padding-bottom: 10px; flex-shrink: 0;
        }

        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 1px solid #111;
          color: #fff;
          padding: 10px 2px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          resize: none; line-height: 1.5;
          min-height: 42px; max-height: 200px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-bottom-color: #333; }
        .input-field::placeholder { color: #1e1e1e; }

        .send-btn {
          background: transparent;
          border: 1px solid #1e1e1e;
          color: #333;
          padding: 10px 16px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { border-color: #fff; color: #fff; }
        .send-btn:disabled { border-color: #0d0d0d; color: #111; cursor: default; }
        .stop-btn { border-color: #333; color: #555; }
        .stop-btn:hover { border-color: #fff; color: #fff; }

        .input-hint {
          font-size: 10px; color: #1a1a1a;
          margin-top: 6px; letter-spacing: 0.5px;
        }
      `}</style>
    </>
  )
}
