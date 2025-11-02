import dotenv from 'dotenv'
dotenv.config()
import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/driverdb',
})

export async function q(text, params) {
  const res = await pool.query(text, params)
  return res
}
