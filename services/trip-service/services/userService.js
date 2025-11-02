import axios from 'axios'
const BASE = process.env.USER_SERVICE_URL || 'http://user-service:3000'

export async function verifyUser(userId, authHeader) {
  try {
    await axios.get(`${BASE}/healthz`, {
      timeout: 1500,
      headers: { Authorization: authHeader || '' },
    })
  } catch {}
}
