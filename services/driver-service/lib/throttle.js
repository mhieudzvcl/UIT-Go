const seen = new Map()
export function shouldThrottle(key, ms = 3000) {
  const now = Date.now()
  const last = seen.get(key) || 0
  if (now - last < ms) return true
  seen.set(key, now)
  return false
}
