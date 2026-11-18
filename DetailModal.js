import { getSeverityColor, getStatusLabel } from '../data/reports'

export default function DetailModal({ report, onClose }) {
  if (!report) return null
  const sevColor = getSeverityColor(report.severity)

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="detail">
        {/* HEADER */}
        <div className="detail-header">
          <div>
            <div className="detail-id">{report.id}</div>
            <div className="detail-title">
              {report.groupFlag} {report.group} — {report.type}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BADGES */}
        <div className="detail-badges">
          <span
            className="d-badge"
            style={{
              color: sevColor,
              borderColor: sevColor + '44',
              background: sevColor + '15',
            }}
          >
            {report.severity.toUpperCase()}
          </span>
          <span
            className="d-badge"
            style={{ color: '#90a0ff', borderColor: '#90a0ff33', background: '#90a0ff11' }}
          >
            {report.type}
          </span>
          <span
            className="d-badge"
            style={{ color: '#60a0d0', borderColor: '#60a0d033', background: '#60a0d011' }}
          >
            {report.source === 'telegram'
              ? '✈ ' + report.channel
              : '◎ ' + (report.serverName || report.channel)}
          </span>
          <span
            className="d-badge"
            style={{ color: '#a0c080', borderColor: '#a0c08033', background: '#a0c08011' }}
          >
            {getStatusLabel(report.status)}
          </span>
        </div>

        {/* GRID */}
        <div className="detail-grid">
          <div className="d-row">
            <span className="d-label">TARGET</span>
            <span className="d-val highlight">{report.target}</span>
          </div>
          <div className="d-row">
            <span className="d-label">TIPO</span>
            <span className="d-val">{report.targetType}</span>
          </div>
          {report.records && (
            <div className="d-row">
              <span className="d-label">REGISTROS</span>
              <span className="d-val highlight">{report.records.toLocaleString()}</span>
            </div>
          )}
          <div className="d-row">
            <span className="d-label">PRECIO</span>
            <span className="d-val" style={{ color: '#80c060' }}>{report.price}</span>
          </div>
          <div className="d-row">
            <span className="d-label">VISTAS</span>
            <span className="d-val">
              {report.views.toLocaleString()} · {report.reactions.toLocaleString()} reacciones
            </span>
          </div>
          <div className="d-row">
            <span className="d-label">FECHA</span>
            <span className="d-val">
              {new Date(report.timestamp).toLocaleString('es-CL')}
            </span>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="d-section">
          <div className="d-section-title">DESCRIPCIÓN COMPLETA</div>
          <p className="d-desc">{report.description}</p>
        </div>

        {/* ARCHIVOS */}
        {report.files && report.files.length > 0 && (
          <div className="d-section">
            <div className="d-section-title">ARCHIVOS LISTADOS</div>
            <div className="file-list">
              {report.files.map((f) => (
                <div key={f} className="file-item">📁 {f}</div>
              ))}
            </div>
          </div>
        )}

        {/* TAGS */}
        <div className="d-section">
          <div className="d-section-title">ETIQUETAS</div>
          <div className="tag-list">
            {report.tags.map((t) => (
              <span key={t} className="d-tag">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 300;
          padding: 16px;
          backdrop-filter: blur(3px);
          font-family: 'Courier New', Courier, monospace;
        }
        .detail {
          background: #060b14;
          border: 1px solid #1a3050;
          width: 640px;
          max-width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .detail-id {
          font-size: 10px;
          color: #2a5a8a;
          letter-spacing: 3px;
          margin-bottom: 6px;
        }
        .detail-title {
          font-size: 15px;
          color: #90c8ff;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .close-btn {
          background: transparent;
          border: 1px solid #1a3050;
          color: #3a6a9a;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .close-btn:hover {
          border-color: #ff2d55;
          color: #ff2d55;
        }
        .detail-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .d-badge {
          font-size: 10px;
          letter-spacing: 1px;
          padding: 3px 10px;
          border: 1px solid;
        }
        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid #0d1f30;
          padding: 14px;
          background: #040810;
        }
        .d-row {
          display: flex;
          gap: 12px;
          font-size: 12px;
          align-items: flex-start;
        }
        .d-label {
          color: #2a5a8a;
          letter-spacing: 2px;
          white-space: nowrap;
          min-width: 90px;
          flex-shrink: 0;
        }
        .d-val { color: #70b0d0; }
        .d-val.highlight {
          color: #90d0ff;
          font-weight: bold;
        }
        .d-section-title {
          font-size: 10px;
          letter-spacing: 3px;
          color: #2a5a8a;
          margin-bottom: 8px;
        }
        .d-desc {
          font-size: 12px;
          color: #5090b0;
          line-height: 1.7;
          margin: 0;
        }
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .file-item {
          font-size: 11px;
          color: #3a7a9a;
          padding: 5px 10px;
          border: 1px solid #0d1f30;
          background: #040810;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .d-tag {
          font-size: 11px;
          color: #2a5a8a;
          padding: 3px 10px;
          border: 1px solid #0d2030;
          background: #040810;
        }
      `}</style>
    </div>
  )
}
