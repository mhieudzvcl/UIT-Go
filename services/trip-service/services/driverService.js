import axios from 'axios'
const base = process.env.DRIVER_SERVICE_URL // http://driver-service:8002

export async function findNearbyDriver(lat, lng) {
  const res = await axios.get(`${base}/drivers`, {
    params: { near: `${lat},${lng}`, radius_km: 3, status: 'online' },
  })
  return res.data?.[0] || null
}
