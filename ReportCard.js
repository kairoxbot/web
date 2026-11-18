import { getSeverityColor, formatCount, timeAgo } from '../data/reports'

export default function ReportCard({ report, onClick }) {
  const sevColor = getSeverityColor(report.severity)
  const ago = timeAgo(report.timestamp)
  const recStr = formatCount(report.records)

  return (
    <div className="card" onClick={() => onClick(report)}>
      <div className="card-top">
        <div className="card-left">
          <span
            className="sev-badge"
            style={{
              background: sevColor + '22',
              color: sevColor,
              borderColor: sevColor + '44',
            }}
          >
            {report.severity.toUpperCase()}
          </span>
          <span className="source-badge" data-source={report.source}>
            {report.source === 'telegram' ? '✈ TELEGRAM' : '◎ DISCORD'}
          </span>
          {report.isNew && <span className="new-badge">NEW</span>}
        </div>
        <span className="card-time">{ago}</span>
      </div>

      <div className="card-title">
        <span className="group-flag">{report.groupFlag}</span>
        <span className="group-name">{report.group}</span>
        <span className="type-sep">·</span>
        <span className="report-type">{report.type}</span>
      </div>

      <div className="card-target">
        <span className="target-label">TARGET:</span>
        <span className="target-val">{report.target}</span>
      </div>

      <p className="card-desc">
        {report.description.slice(0, 160)}
        {report.description.length > 160 ? '...' : ''}
      </p>

      <div className="card-footer">
        <div className="card-tags">
          {report.tags.slice(0, 4).map((t) => (
            <span key={t} className="ftag">#{t}</span>
          ))}
        </div>
        <div className="card-meta">
          {recStr && (
            <span className="meta-item" title="Registros expuestos">
              🗃 {recStr}
            </span>
          )}
          <span className="meta-item" title="Vistas">
            👁 {(report.views / 1000).toFixed(1)}K
          </span>
          <span className="price-tag">{report.price}</span>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: 1px solid #0d1a28;
          background: #060a12;
          padding: 16px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: 'Courier New', Courier, monospace;
        }
        .card:hover {
          border-color: #1a3a5a;
          background: #07101a;
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .card-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sev-badge {
          font-size: 10px;
          letter-spacing: 2px;
          padding: 2px 8px;
          border: 1px solid;
          font-weight: bold;
        }
        .source-badge {
          font-size: 10px;
          letter-spacing: 1px;
          padding: 2px 8px;
          border: 1px solid;
        }
        .source-badge[data-source='telegram'] {
          color: #0088cc;
          border-color: #0088cc33;
          background: #0088cc11;
        }
        .source-badge[data-source='discord'] {
          color: #7289da;
          border-color: #7289da33;
          background: #7289da11;
        }
        .new-badge {
          font-size: 10px;
          letter-spacing: 2px;
          padding: 2px 8px;
          border: 1px solid #ff9500;
          color: #ff9500;
          background: #ff950011;
          animation: flash 2s ease-in-out infinite;
        }
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .card-time {
          font-size: 10px;
          color: #2a4a6a;
          white-space: nowrap;
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .group-flag { font-size: 16px; }
        .group-name {
          font-size: 14px;
          font-weight: bold;
          color: #90c8ff;
          letter-spacing: 1px;
        }
        .type-sep { color: #2a4a6a; }
        .report-type {
          font-size: 13px;
          color: #6090c0;
        }
        .card-target {
          display: flex;
          gap: 8px;
          font-size: 12px;
        }
        .target-label {
          color: #2a5a8a;
          letter-spacing: 2px;
          white-space: nowrap;
        }
        .target-val {
          color: #80c0e8;
          font-weight: bold;
        }
        .card-desc {
          font-size: 12px;
          color: #3a6a9a;
          line-height: 1.6;
          margin: 0;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 8px;
          border-top: 1px solid #0a1824;
        }
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .ftag {
          font-size: 10px;
          color: #2a4a6a;
          padding: 1px 6px;
          border: 1px solid #0d2030;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .meta-item {
          font-size: 11px;
          color: #2a5a8a;
        }
        .price-tag {
          font-size: 11px;
          color: #80c060;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
