import { formatBytes } from '../utils/format'
import './OutputPanel.css'

const STAGE_LABEL = {
  idle: 'Ready',
  capturing: 'Capturing frames',
  encoding: 'Encoding GIF',
  done: 'Done',
}

function OutputPanel({
  isConverting,
  stage,
  progress,
  gifUrl,
  gifSize,
  onConvert,
  onCancel,
  onReset,
  fileName,
  error,
}) {
  const pct = Math.round(progress * 100)
  const downloadName =
    (fileName?.replace(/\.[^/.]+$/, '') || 'video') + '.gif'

  return (
    <div className="output">
      <div className="output-left">
        <div className="output-actions">
          {!isConverting && !gifUrl && (
            <button
              type="button"
              className="btn btn-primary big"
              onClick={onConvert}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M5 4v16l14-8L5 4Z"
                  fill="currentColor"
                />
              </svg>
              Convert to GIF
            </button>
          )}

          {isConverting && (
            <button
              type="button"
              className="btn btn-danger big"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}

          {gifUrl && (
            <>
              <a
                className="btn btn-primary big"
                href={gifUrl}
                download={downloadName}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path
                    d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download GIF
              </a>
              <button
                type="button"
                className="btn"
                onClick={onConvert}
              >
                Re-encode
              </button>
            </>
          )}

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onReset}
            disabled={isConverting}
          >
            Use another video
          </button>
        </div>

        <div className="status">
          <div className="status-head">
            <span className="status-stage">{STAGE_LABEL[stage]}</span>
            {(isConverting || stage === 'done') && (
              <span className="status-pct">{pct}%</span>
            )}
          </div>
          <div className="progress">
            <div
              className="progress-fill"
              style={{ width: `${pct}%` }}
              data-active={isConverting || stage === 'done'}
            />
          </div>

          {error && (
            <p className="output-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="output-right">
        <div className="output-preview">
          {gifUrl ? (
            <img src={gifUrl} alt="Generated GIF preview" />
          ) : (
            <div className="output-placeholder">
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
                <rect
                  x="8"
                  y="14"
                  width="48"
                  height="36"
                  rx="6"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x="32"
                  y="38"
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="ui-monospace, monospace"
                  fill="rgba(255,255,255,0.35)"
                >
                  GIF
                </text>
              </svg>
              <span>Output will appear here</span>
            </div>
          )}
        </div>
        {gifUrl && (
          <div className="output-meta">
            <span className="chip subtle">{formatBytes(gifSize)}</span>
            <span className="chip subtle">{downloadName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutputPanel
