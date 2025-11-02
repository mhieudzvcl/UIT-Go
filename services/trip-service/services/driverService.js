import axios from 'axios'
const BASE = process.env.DRIVER_SERVICE_URL || 'http://driver-service:8002'

export async function findNearbyDriver(lat, lng) {
  const { data } = await axios.get(`${BASE}/drivers/search`, {
    params: { lat, lng, radius_km: 3, status: 'online' },
    timeout: 3000,
  })
  return Array.isArray(data) ? data[0] : null
}
