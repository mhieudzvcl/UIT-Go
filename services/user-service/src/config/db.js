import dotenv from 'dotenv'
import pkg from 'pg'
dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/userdb',
})

export async function q(text, params) {
  const c = await pool.connect()
  try {
    return await c.query(text, params)
  } finally {
    c.release()
  }
}
