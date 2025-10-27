import pool from '../db.js';

export async function createTrip(trip) {
  const { passenger_id, driver_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, price_estimate } = trip;
  const res = await pool.query(
    `INSERT INTO trips(passenger_id, driver_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, price_estimate, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'accepted') RETURNING *`,
    [passenger_id, driver_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, price_estimate]
  );
  return res.rows[0];
}

export async function getTripById(id) {
  const res = await pool.query('SELECT * FROM trips WHERE id=$1', [id]);
  return res.rows[0];
}

export async function updateTripStatus(id, status) {
  const res = await pool.query('UPDATE trips SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
  return res.rows[0];
}
