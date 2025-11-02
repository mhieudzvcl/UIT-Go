// services/driver-service/src/db.js
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/driverdb',
})

/**
 * Helper query: dùng chung cho routers
 * @param {string} text - SQL text
 * @param {any[]} [params] - params
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function q(text, params) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}
