const lastUpdate = new Map(); // key: driverId -> ts
export function shouldThrottle(driverId, thresholdMs) {
  const now = Date.now();
  const last = lastUpdate.get(driverId) || 0;
  if (now - last < thresholdMs) return true;
  lastUpdate.set(driverId, now);
  return false;
}
