import axios from 'axios'
const base = process.env.PAYMENT_SERVICE_URL // http://payment-service:3004

export async function estimatePrice(distance_km) {
  const res = await axios.post(`${base}/payments/estimate`, { distance_km })
  return res.data.amount
}

export async function chargeTrip(trip_id, amount) {
  const res = await axios.post(`${base}/payments/charge`, { trip_id, amount })
  return res.data
}
