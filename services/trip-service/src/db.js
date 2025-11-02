import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/tripdb',
})

export async function q(text, params) {
  return pool.query(text, params)
}
