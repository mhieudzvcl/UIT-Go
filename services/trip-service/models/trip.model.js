import { q } from '../src/db.js'

export async function createTrip({
  passenger_id,
  driver_id,
  pickup_lat,
  pickup_lng,
  dropoff_lat,
  dropoff_lng,
  price_estimate,
}) {
  const sql = `
    INSERT INTO trips
      (rider_id, driver_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status, price_estimate)
    VALUES ($1,$2,$3,$4,$5,$6,'searching',$7)
    RETURNING *`
  const params = [
    passenger_id,
    driver_id,
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
    price_estimate,
  ]
  const { rows } = await q(sql, params)
  return rows[0]
}

export async function getTripById(id) {
  const { rows } = await q('SELECT * FROM trips WHERE id=$1', [id])
  return rows[0]
}

export async function updateTripStatus(id, status) {
  const { rows } = await q(
    'UPDATE trips SET status=$1, updated_at=now() WHERE id=$2 RETURNING *',
    [status, id]
  )
  return rows[0]
}
