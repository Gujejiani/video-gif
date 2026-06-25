import { useMemo } from 'react'
import './ControlsPanel.css'

const FPS_PRESETS = [8, 12, 15, 20, 24, 30]
const WIDTH_PRESETS = [240, 360, 480, 640, 720]
const QUALITY_PRESETS = [
  { label: 'High', value: 90 },
  { label: 'Balanced', value: 60 },
  { label: 'Small', value: 30 },
]

function ControlsPanel({
  settings,
  onSettingsChange,
  sourceWidth,
  outputSize,
  estimatedFrames,
  duration,
  disabled,
}) {
  const update = (patch) => onSettingsChange({ ...settings, ...patch })

  const sizeHint = useMemo(() => {
    // Rough estimate: bytes per pixel per frame, very approximate
    const pxPerFrame = outputSize.w * outputSize.h
    const bytes = pxPerFrame * estimatedFrames * 0.15
    if (!bytes) return null
    if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`
    return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [outputSize, estimatedFrames])

  const widthCap = Math.max(120, sourceWidth || 1280)

  return (
    <div className="controls">
      <div className="field">
        <div className="field-head">
          <label htmlFor="fps">Frame rate</label>
          <span className="field-value">{settings.fps} fps</span>
        </div>
        <input
          id="fps"
          type="range"
          min={4}
          max={30}
          step={1}
          value={settings.fps}
          onChange={(e) => update({ fps: Number(e.target.value) })}
          disabled={disabled}
          className="slider"
        />
        <div className="presets">
          {FPS_PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`preset ${settings.fps === p ? 'is-active' : ''}`}
              onClick={() => update({ fps: p })}
              disabled={disabled}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="field-head">
          <label htmlFor="width">Width</label>
          <span className="field-value">
            {outputSize.w} × {outputSize.h}
          </span>
        </div>
        <input
          id="width"
          type="range"
          min={120}
          max={widthCap}
          step={20}
          value={Math.min(settings.width, widthCap)}
          onChange={(e) => update({ width: Number(e.target.value) })}
          disabled={disabled}
          className="slider"
        />
        <div className="presets">
          {WIDTH_PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`preset ${settings.width === p ? 'is-active' : ''}`}
              onClick={() => update({ width: p })}
              disabled={disabled || p > widthCap}
            >
              {p}px
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="field-head">
          <label>Quality</label>
          <span className="field-value">
            {QUALITY_PRESETS.find((q) => q.value === settings.quality)?.label ??
              `${settings.quality}`}
          </span>
        </div>
        <div className="segmented" role="radiogroup" aria-label="Quality">
          {QUALITY_PRESETS.map((q) => (
            <button
              key={q.value}
              type="button"
              role="radio"
              aria-checked={settings.quality === q.value}
              className={`seg ${settings.quality === q.value ? 'is-active' : ''}`}
              onClick={() => update({ quality: q.value })}
              disabled={disabled}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.loop}
            onChange={(e) => update({ loop: e.target.checked })}
            disabled={disabled}
          />
          <span>Loop forever</span>
        </label>
      </div>

      <div className="summary">
        <div>
          <span className="summary-label">Duration</span>
          <span className="summary-value">{duration.toFixed(1)}s</span>
        </div>
        <div>
          <span className="summary-label">Frames</span>
          <span className="summary-value">{estimatedFrames}</span>
        </div>
        <div>
          <span className="summary-label">Est. size</span>
          <span className="summary-value">{sizeHint ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default ControlsPanel
