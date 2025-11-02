import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/payments',
})
