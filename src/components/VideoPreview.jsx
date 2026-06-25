import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import RangeSlider from './RangeSlider'
import { formatTime } from '../utils/format'
import './VideoPreview.css'

const VideoPreview = forwardRef(function VideoPreview(
  { src, onMetaLoaded, range, onRangeChange, duration },
  ref,
) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)

  useImperativeHandle(ref, () => videoRef.current, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onMeta = () => {
      onMetaLoaded?.({
        duration: v.duration,
        width: v.videoWidth,
        height: v.videoHeight,
      })
    }
    const onTime = () => setCurrent(v.currentTime)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [onMetaLoaded, src])

  // Loop within range during playback for a preview feel
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tick = () => {
      if (v.currentTime > range[1]) {
        v.currentTime = range[0]
      }
    }
    v.addEventListener('timeupdate', tick)
    return () => v.removeEventListener('timeupdate', tick)
  }, [range])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      if (v.currentTime < range[0] || v.currentTime > range[1]) {
        v.currentTime = range[0]
      }
      v.play()
    } else {
      v.pause()
    }
  }

  return (
    <div className="video-preview">
      <div className="video-wrap">
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onClick={togglePlay}
        />
        <button
          type="button"
          className={`play-btn ${playing ? 'is-playing' : ''}`}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="trim">
        <div className="trim-head">
          <span className="trim-label">Trim</span>
          <span className="trim-time">
            <span>{formatTime(range[0])}</span>
            <span className="trim-arrow">→</span>
            <span>{formatTime(range[1])}</span>
            <span className="trim-dur">
              ({formatTime(Math.max(0, range[1] - range[0]))})
            </span>
          </span>
        </div>
        <RangeSlider
          min={0}
          max={duration || 0}
          step={0.1}
          value={range}
          onChange={onRangeChange}
          marker={current}
        />
      </div>
    </div>
  )
})

export default VideoPreview
