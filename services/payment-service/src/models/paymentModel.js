import { pool } from '../index.js'

export async function createPaymentModel(trip_id, amount) {
  const sql = `
    INSERT INTO payments(trip_id, amount, status)
    VALUES ($1,$2,'captured')
    RETURNING id, trip_id, amount, status, created_at
  `
  const { rows } = await pool.query(sql, [trip_id, amount])
  return rows[0]
}
