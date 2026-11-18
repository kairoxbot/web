import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { reports, getStats, getSeverityColor } from '../data/reports'
import ReportCard from '../components/ReportCard'
import DetailModal from '../components/DetailModal'

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!user || !pass) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        try { localStorage.setItem('noobai_admin_token', data.token) } catch {}
        onLogin(data.token)
      } else {
        setError(data.error || 'Credenciales incorrectas')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          NOOB<span style={{ color: '#00aaff' }}>.</span>AI
          <span className="login-sub">PANEL DE INTELIGENCIA</span>
        </div>
        <div className="login-line" />
        <form onSubmit={submit} className="login-form">
          <div className="field">
            <label>USUARIO</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="off"
              autoFocus
              spellCheck={false}
            />
          </div>
          <div className="field">
            <label>CONTRASEÑA</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          {error && <div className="login-error">⚠ {error}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'VERIFICANDO...' : 'ACCEDER →'}
          </button>
        </form>
        <div className="login-footer">
          NoobAI Threat Intelligence · Acceso restringido
        </div>
      </div>

      <style jsx>{`
        .login-wrap {
          min-height: 100vh;
          background: #040608;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', Courier, monospace;
          background-image: radial-gradient(ellipse at 50% 0%, #0a0f1a 0%, #040608 70%);
        }
        .login-box {
          width: 380px;
          max-width: calc(100vw - 32px);
          border: 1px solid #0d1f2d;
          background: #060a10;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 0 60px #00aaff08;
        }
        .login-logo {
          font-size: 22px;
          font-weight: bold;
          letter-spacing: 6px;
          color: #00ff88;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .login-sub {
          font-size: 10px;
          letter-spacing: 4px;
          color: #2a4a6a;
          font-weight: normal;
        }
        .login-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, #0d2a3d, transparent);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 10px;
          letter-spacing: 3px;
          color: #2a5a7a;
        }
        .field input {
          background: #040810;
          border: 1px solid #0d2030;
          color: #90d0ff;
          padding: 10px 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field input:focus { border-color: #00aaff60; }
        .login-error {
          font-size: 12px;
          color: #ff2d55;
          padding: 8px;
          border: 1px solid #ff2d5530;
          background: #ff2d5508;
        }
        .login-btn {
          background: transparent;
          border: 1px solid #00aaff;
          color: #00aaff;
          padding: 12px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          letter-spacing: 4px;
          transition: all 0.15s;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) { background: #00aaff15; }
        .login-btn:disabled { opacity: 0.4; cursor: default; }
        .login-footer {
          font-size: 10px;
          color: #1a2a3a;
          text-align: center;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sevFilter, setSevFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [tick, setTick] = useState(0)
  const stats = getStats()

  useEffect(() => {
    try {
      const t = localStorage.getItem('noobai_admin_token')
      if (t) { setToken(t); setAuthed(true) }
    } catch {}
    setLoading(false)
  }, [])

  // Auto-refresh counter — cosmetic, simulates live feed
  useEffect(() => {
    if (!authed) return
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [authed])

  const logout = () => {
    try { localStorage.removeItem('noobai_admin_token') } catch {}
    setAuthed(false)
    setToken(null)
  }

  if (loading) return null

  if (!authed) {
    return (
      <>
        <Head><title>NoobAI Admin</title></Head>
        <LoginScreen onLogin={(t) => { setToken(t); setAuthed(true) }} />
      </>
    )
  }

  const filtered = reports.filter((r) => {
    if (filter === 'telegram' && r.source !== 'telegram') return false
    if (filter === 'discord' && r.source !== 'discord') return false
    if (sevFilter !== 'all' && r.severity !== sevFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.group.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q))
      )
    }
    return true
  })

  const sortedFiltered = [...filtered].sort((a, b) => b.timestamp - a.timestamp)

  const GROUPS = [
    { name: 'SoulhemTeam', flag: '🇻🇪', color: '#ff9500' },
    { name: 'Chronus', flag: '⚫', color: '#c0c0c0' },
    { name: 'Canal 157', flag: '🇲🇽', color: '#00ff88' },
    { name: 'Grupo 141', flag: '🇲🇽', color: '#ff2d55' },
    { name: 'KelvinSecurity', flag: '🇻🇪', color: '#ff9500' },
    { name: 'GhostSec', flag: '👻', color: '#a0a0ff' },
    { name: 'BrasilLeaks', flag: '🇧🇷', color: '#00ff88' },
    { name: 'NullByte Cartel', flag: '🌐', color: '#7289da' },
    { name: 'Anonymous LATAM', flag: '🌐', color: '#c0c0c0' },
    { name: 'DarkHydra', flag: '⚫', color: '#8080ff' },
    { name: 'GrizzBears', flag: '🐻', color: '#d0a060' },
  ]

  return (
    <>
      <Head>
        <title>NoobAI — Threat Intel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {selected && (
        <DetailModal report={selected} onClose={() => setSelected(null)} />
      )}

      <div className="dash">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="dash-logo">
              NOOB<span style={{ color: '#00aaff' }}>.</span>AI
              <span className="dash-sub">INTEL</span>
            </div>
            <div className="live-dot">
              <span className="live-indicator" />
              <span className="live-label">LIVE</span>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="topbar-tick">actualizado hace {tick * 30}s</span>
            <Link href="/" className="topbar-btn">AI CHAT</Link>
            <button className="topbar-btn danger" onClick={logout}>SALIR</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">TOTAL</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ff2d55' }}>{stats.critical}</div>
            <div className="stat-label">CRÍTICOS</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ff9500' }}>{stats.today}</div>
            <div className="stat-label">ÚLTIMAS 24H</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#0088cc' }}>{stats.telegram}</div>
            <div className="stat-label">TELEGRAM</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#7289da' }}>{stats.discord}</div>
            <div className="stat-label">DISCORD</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ff9500' }}>{stats.newReports}</div>
            <div className="stat-label">NUEVOS</div>
          </div>
        </div>

        {/* GROUP CHIPS */}
        <div className="groups-row">
          {GROUPS.map((g) => {
            const count = reports.filter((r) => r.group === g.name).length
            if (count === 0) return null
            return (
              <button
                key={g.name}
                className="group-chip"
                style={{ '--gc': g.color }}
                onClick={() => setSearch(search === g.name ? '' : g.name)}
              >
                <span className="chip-flag">{g.flag}</span>
                <span className="chip-name">{g.name}</span>
                <span className="chip-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* FILTERS */}
        <div className="filters-row">
          <div className="filter-group">
            {['all', 'telegram', 'discord'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'TODOS' : f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="filter-group">
            {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
              <button
                key={s}
                className={`filter-btn ${sevFilter === s ? 'active' : ''}`}
                style={
                  sevFilter === s && s !== 'all'
                    ? { borderColor: getSeverityColor(s), color: getSeverityColor(s) }
                    : {}
                }
                onClick={() => setSevFilter(s)}
              >
                {s === 'all' ? 'ALL SEV' : s.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="grupo, target, tipo, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* RESULTS BAR */}
        <div className="results-bar">
          <span>{sortedFiltered.length} reportes</span>
          {(search || filter !== 'all' || sevFilter !== 'all') && (
            <button
              className="reset-btn"
              onClick={() => { setSearch(''); setFilter('all'); setSevFilter('all') }}
            >
              limpiar filtros
            </button>
          )}
        </div>

        {/* GRID */}
        <div className="reports-grid">
          {sortedFiltered.length === 0 ? (
            <div className="empty">⚠ Sin resultados para los filtros actuales</div>
          ) : (
            sortedFiltered.map((r) => (
              <ReportCard key={r.id} report={r} onClick={setSelected} />
            ))
          )}
        </div>

        <div className="dash-footer">
          NoobAI Threat Intelligence · {new Date().getFullYear()}
        </div>
      </div>

      <style jsx>{`
        .dash {
          min-height: 100vh;
          background: #040608;
          color: #80b0d0;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          flex-direction: column;
        }
        /* TOPBAR */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 50px;
          border-bottom: 1px solid #0a1824;
          background: #050810;
          position: sticky;
          top: 0;
          z-index: 20;
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .dash-logo { font-size: 17px; font-weight: bold; letter-spacing: 5px; color: #00ff88; }
        .dash-sub { font-size: 10px; color: #2a4a6a; margin-left: 8px; letter-spacing: 4px; font-weight: normal; }
        .live-dot { display: flex; align-items: center; gap: 5px; }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 #ff2d5540; }
          50% { opacity: 0.6; box-shadow: 0 0 0 4px transparent; }
        }
        .live-indicator {
          width: 7px; height: 7px; border-radius: 50%;
          background: #ff2d55;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        .live-label { font-size: 10px; color: #ff2d55; letter-spacing: 3px; }
        .topbar-actions { display: flex; align-items: center; gap: 8px; }
        .topbar-tick { font-size: 10px; color: #1a3a5a; }
        .topbar-btn {
          background: transparent; border: 1px solid #0d2030; color: #3a6a9a;
          padding: 4px 12px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px; letter-spacing: 2px;
          text-decoration: none; display: inline-block;
          transition: all 0.15s;
        }
        .topbar-btn:hover { border-color: #00aaff; color: #00aaff; }
        .topbar-btn.danger:hover { border-color: #ff2d55; color: #ff2d55; }
        /* STATS */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px; background: #0a1824;
          border-bottom: 1px solid #0a1824;
        }
        @media (max-width: 700px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 400px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        .stat-card {
          background: #050810; padding: 14px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .stat-num { font-size: 24px; font-weight: bold; color: #60a0d0; line-height: 1; font-variant-numeric: tabular-nums; }
        .stat-label { font-size: 9px; letter-spacing: 2px; color: #2a4a6a; }
        /* GROUPS */
        .groups-row {
          display: flex; flex-wrap: wrap; gap: 5px;
          padding: 10px 20px; border-bottom: 1px solid #0a1824;
          background: #040710;
        }
        .group-chip {
          display: flex; align-items: center; gap: 5px;
          background: transparent; border: 1px solid #0d1f2d;
          padding: 4px 9px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px; color: var(--gc, #60a0d0);
          transition: all 0.15s; letter-spacing: 0.5px;
        }
        .group-chip:hover {
          border-color: var(--gc, #60a0d0);
          background: rgba(0,0,0,0.3);
        }
        .chip-flag { font-size: 12px; }
        .chip-name { opacity: 0.85; }
        .chip-count { font-size: 10px; font-weight: bold; opacity: 0.7; }
        /* FILTERS */
        .filters-row {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 10px 20px; border-bottom: 1px solid #0a1824;
          align-items: center; background: #050810;
        }
        .filter-group { display: flex; gap: 3px; }
        .filter-btn {
          background: transparent; border: 1px solid #0d1f2d; color: #3a6a9a;
          padding: 5px 11px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px; letter-spacing: 1px; transition: all 0.15s;
        }
        .filter-btn:hover, .filter-btn.active { background: #0d2030; color: #90c0e0; border-color: #1a4060; }
        .search-wrap {
          flex: 1; min-width: 180px;
          display: flex; align-items: center; gap: 6px;
          border: 1px solid #0d1f2d; padding: 0 10px; background: #040810;
        }
        .search-icon { color: #2a5a8a; font-size: 14px; }
        .search-input {
          flex: 1; background: transparent; border: none;
          color: #80b0d0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px; padding: 7px 0; outline: none;
        }
        .search-input::placeholder { color: #1a3a5a; }
        .search-clear {
          background: transparent; border: none; color: #3a6a9a;
          cursor: pointer; font-size: 11px; padding: 2px;
        }
        .search-clear:hover { color: #ff2d55; }
        /* RESULTS */
        .results-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 7px 20px; font-size: 10px; color: #2a4a6a;
          letter-spacing: 1px; border-bottom: 1px solid #0a1824;
        }
        .reset-btn {
          background: transparent; border: none; color: #3a6080;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px; text-decoration: underline;
        }
        /* GRID */
        .reports-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1px; background: #0a1824;
        }
        @media (max-width: 400px) { .reports-grid { grid-template-columns: 1fr; } }
        .empty {
          grid-column: 1 / -1; padding: 60px;
          text-align: center; color: #2a4a6a; font-size: 13px;
          background: #050810;
        }
        .dash-footer {
          padding: 10px 20px; font-size: 10px; color: #0d2030;
          letter-spacing: 1px; border-top: 1px solid #0a1824; text-align: center;
        }
      `}</style>
    </>
  )
}
