import { useCallback, useRef, useState } from 'react'
import './Dropzone.css'

function Dropzone({ onFile, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) onFile(f)
    },
    [onFile],
  )

  const onPick = useCallback(
    (e) => {
      const f = e.target.files?.[0]
      if (f) onFile(f)
      e.target.value = ''
    },
    [onFile],
  )

  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={onPick}
      />

      <div className="dz-glow" aria-hidden="true" />
      <div className="dz-inner">
        <div className="dz-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
            <rect
              x="6"
              y="14"
              width="52"
              height="36"
              rx="8"
              stroke="url(#dzg)"
              strokeWidth="2"
            />
            <path
              d="M27 26v12l10-6-10-6Z"
              fill="url(#dzg)"
              opacity="0.9"
            />
            <defs>
              <linearGradient id="dzg" x1="6" y1="14" x2="58" y2="50">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.5" stopColor="#f472b6" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="dz-title">
          Drop a video to turn into a <span className="grad">GIF</span>
        </h1>
        <p className="dz-sub">
          mp4, webm, mov · everything runs in your browser
        </p>

        <button type="button" className="btn btn-primary dz-cta">
          Choose video
        </button>

        {error && <p className="dz-error" role="alert">{error}</p>}

        <ul className="dz-features">
          <li>⚡ No upload</li>
          <li>🎯 Trim & resize</li>
          <li>🎚️ FPS & quality</li>
          <li>🔒 Private by design</li>
        </ul>
      </div>
    </div>
  )
}

export default Dropzone
