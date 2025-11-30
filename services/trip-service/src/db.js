import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DB_URL,
})

// Only connect if DB_URL is explicitly set to avoid errors in dev/test
if (process.env.DB_URL) {
  pool
    .connect()
    .then(() => console.log('DB connected'))
    .catch((err) => console.error('DB error', err))
} else {
  console.log('DB pool created but not connected (set DB_URL to enable)')
}

export default pool
