export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let u = -1
  let n = bytes
  do {
    n /= 1024
    u++
  } while (n >= 1024 && u < units.length - 1)
  return `${n.toFixed(n < 10 ? 2 : 1)} ${units[u]}`
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const s = Math.max(0, seconds)
  const m = Math.floor(s / 60)
  const r = s - m * 60
  const rs = r < 10 ? `0${r.toFixed(1)}` : r.toFixed(1)
  return `${m}:${rs}`
}

export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}
