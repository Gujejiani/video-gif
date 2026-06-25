import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp } from '../utils/format'
import './RangeSlider.css'

function RangeSlider({ min = 0, max = 1, step = 0.1, value, onChange, marker }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(null) // 'min' | 'max' | null
  const [lo, hi] = value

  const valueToPct = useCallback(
    (v) => {
      if (max - min <= 0) return 0
      return ((v - min) / (max - min)) * 100
    },
    [min, max],
  )

  const pctToValue = useCallback(
    (pct) => {
      const raw = min + (pct / 100) * (max - min)
      const stepped = Math.round(raw / step) * step
      return Number(stepped.toFixed(3))
    },
    [min, max, step],
  )

  const positionFromEvent = useCallback((e) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const pct = ((clientX - rect.left) / rect.width) * 100
    return clamp(pct, 0, 100)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const move = (e) => {
      const pct = positionFromEvent(e)
      const v = pctToValue(pct)
      if (dragging === 'min') {
        const newLo = clamp(v, min, hi - step)
        onChange([newLo, hi])
      } else if (dragging === 'max') {
        const newHi = clamp(v, lo + step, max)
        onChange([lo, newHi])
      }
    }
    const up = () => setDragging(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [dragging, lo, hi, min, max, step, onChange, pctToValue, positionFromEvent])

  const loPct = valueToPct(lo)
  const hiPct = valueToPct(hi)
  const markerPct =
    marker != null ? clamp(valueToPct(marker), 0, 100) : null

  return (
    <div className="rs" ref={trackRef}>
      <div className="rs-track" />
      <div
        className="rs-range"
        style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
      />
      {markerPct != null && (
        <div className="rs-marker" style={{ left: `${markerPct}%` }} />
      )}
      <button
        type="button"
        className="rs-thumb"
        style={{ left: `${loPct}%` }}
        onMouseDown={() => setDragging('min')}
        onTouchStart={() => setDragging('min')}
        aria-label="Start time"
      />
      <button
        type="button"
        className="rs-thumb"
        style={{ left: `${hiPct}%` }}
        onMouseDown={() => setDragging('max')}
        onTouchStart={() => setDragging('max')}
        aria-label="End time"
      />
    </div>
  )
}

export default RangeSlider
