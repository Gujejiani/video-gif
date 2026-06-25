import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GIF from 'gif.js'
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url'
import Dropzone from './components/Dropzone'
import VideoPreview from './components/VideoPreview'
import ControlsPanel from './components/ControlsPanel'
import OutputPanel from './components/OutputPanel'
import Header from './components/Header'
import { formatBytes, formatTime } from './utils/format'
import './App.css'

const DEFAULT_SETTINGS = {
  fps: 24,
  width: 480,
  quality: 5, // gif.js: lower = better (1..30) — 5 = High
  loop: true,
}

function App() {
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [meta, setMeta] = useState(null) // {duration, width, height}
  const [range, setRange] = useState([0, 0])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('idle') // idle | capturing | encoding | done
  const [gifUrl, setGifUrl] = useState(null)
  const [gifSize, setGifSize] = useState(0)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const cancelRef = useRef(false)

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      if (gifUrl) URL.revokeObjectURL(gifUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (gifUrl) URL.revokeObjectURL(gifUrl)
    setFile(null)
    setVideoUrl(null)
    setMeta(null)
    setRange([0, 0])
    setSettings(DEFAULT_SETTINGS)
    setIsConverting(false)
    setProgress(0)
    setStage('idle')
    setGifUrl(null)
    setGifSize(0)
    setError(null)
    cancelRef.current = false
  }, [videoUrl, gifUrl])

  const handleFile = useCallback(
    (f) => {
      if (!f) return
      if (!f.type.startsWith('video/')) {
        setError('Please choose a video file.')
        return
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      if (gifUrl) URL.revokeObjectURL(gifUrl)
      setError(null)
      setGifUrl(null)
      setGifSize(0)
      setStage('idle')
      setProgress(0)
      setFile(f)
      setVideoUrl(URL.createObjectURL(f))
    },
    [videoUrl, gifUrl],
  )

  const onMetaLoaded = useCallback((m) => {
    setMeta(m)
    setRange([0, Math.min(m.duration, Math.max(2, m.duration))])
    setSettings((s) => ({
      ...s,
      width: Math.min(s.width, m.width || s.width),
    }))
  }, [])

  const estimatedFrames = useMemo(() => {
    if (!meta) return 0
    const dur = Math.max(0, range[1] - range[0])
    return Math.max(1, Math.round(dur * settings.fps))
  }, [range, settings.fps, meta])

  const outputSize = useMemo(() => {
    if (!meta) return { w: 0, h: 0 }
    const ratio = meta.height / meta.width
    const w = Math.min(settings.width, meta.width)
    const h = Math.round(w * ratio)
    return { w, h: h % 2 === 0 ? h : h + 1 }
  }, [meta, settings.width])

  const convert = useCallback(async () => {
    if (!videoRef.current || !meta) return
    setError(null)
    setGifUrl(null)
    setGifSize(0)
    setIsConverting(true)
    setProgress(0)
    setStage('capturing')
    cancelRef.current = false

    const video = videoRef.current
    const [start, end] = range
    const duration = Math.max(0, end - start)
    const totalFrames = Math.max(1, Math.round(duration * settings.fps))
    const { w, h } = outputSize

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const gif = new GIF({
      workers: 2,
      quality: settings.quality,
      width: w,
      height: h,
      workerScript: gifWorkerUrl,
      repeat: settings.loop ? 0 : -1,
    })

    const seekTo = (t) =>
      new Promise((resolve) => {
        const handler = () => {
          video.removeEventListener('seeked', handler)
          resolve()
        }
        video.addEventListener('seeked', handler)
        video.currentTime = Math.min(Math.max(t, 0), meta.duration)
      })

    try {
      // Pause and mute for capture
      video.pause()
      const wasMuted = video.muted
      video.muted = true

      const frameDelayMs = 1000 / settings.fps

      for (let i = 0; i < totalFrames; i++) {
        if (cancelRef.current) throw new Error('cancelled')
        const t = start + (i / settings.fps)
        await seekTo(t)
        ctx.drawImage(video, 0, 0, w, h)
        gif.addFrame(ctx, { copy: true, delay: frameDelayMs })
        setProgress(((i + 1) / totalFrames) * 0.5) // capturing = first 50%
      }

      video.muted = wasMuted

      setStage('encoding')

      const blob = await new Promise((resolve, reject) => {
        gif.on('progress', (p) => {
          // encoding = second 50%
          setProgress(0.5 + p * 0.5)
        })
        gif.on('finished', (b) => resolve(b))
        gif.on('abort', () => reject(new Error('aborted')))
        gif.render()
      })

      if (cancelRef.current) throw new Error('cancelled')

      const url = URL.createObjectURL(blob)
      setGifUrl(url)
      setGifSize(blob.size)
      setStage('done')
      setProgress(1)
    } catch (e) {
      if (e.message !== 'cancelled') {
        console.error(e)
        setError(e.message || 'Conversion failed')
      }
      setStage('idle')
      setProgress(0)
    } finally {
      setIsConverting(false)
    }
  }, [meta, range, settings, outputSize])

  const cancel = useCallback(() => {
    cancelRef.current = true
  }, [])

  return (
    <div className="app">
      <Header />

      <main className="container">
        {!file && (
          <Dropzone onFile={handleFile} error={error} />
        )}

        {file && (
          <div className="grid">
            <section className="card preview-card">
              <div className="card-head">
                <div className="card-title">
                  <span className="dot dot-pink" />
                  Source
                </div>
                <div className="meta-row">
                  <span className="chip">{file.name}</span>
                  <span className="chip subtle">{formatBytes(file.size)}</span>
                  {meta && (
                    <span className="chip subtle">
                      {meta.width}×{meta.height}
                    </span>
                  )}
                  {meta && (
                    <span className="chip subtle">
                      {formatTime(meta.duration)}
                    </span>
                  )}
                </div>
              </div>

              <VideoPreview
                ref={videoRef}
                src={videoUrl}
                onMetaLoaded={onMetaLoaded}
                range={range}
                onRangeChange={setRange}
                duration={meta?.duration ?? 0}
              />
            </section>

            <section className="card controls-card">
              <div className="card-head">
                <div className="card-title">
                  <span className="dot dot-violet" />
                  Settings
                </div>
              </div>
              <ControlsPanel
                settings={settings}
                onSettingsChange={setSettings}
                sourceWidth={meta?.width ?? 0}
                outputSize={outputSize}
                estimatedFrames={estimatedFrames}
                duration={Math.max(0, range[1] - range[0])}
                disabled={isConverting}
              />
            </section>

            <section className="card output-card">
              <div className="card-head">
                <div className="card-title">
                  <span className="dot dot-cyan" />
                  Output
                </div>
              </div>
              <OutputPanel
                isConverting={isConverting}
                stage={stage}
                progress={progress}
                gifUrl={gifUrl}
                gifSize={gifSize}
                onConvert={convert}
                onCancel={cancel}
                onReset={reset}
                fileName={file?.name}
                error={error}
              />
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Made with React + Vite · 100% client-side</span>
      </footer>
    </div>
  )
}

export default App
