import axios from 'axios'
const BASE = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004'

export async function estimatePrice(distanceKm) {
  return distanceKm * 10000
}

export async function chargeTrip(tripId, amount) {
  try {
    await axios.post(
      `${BASE}/payments`,
      { trip_id: tripId, amount },
      { timeout: 3000 }
    )
  } catch {
    /* phase 1: không fail trip nếu payment lỗi */
  }
}
