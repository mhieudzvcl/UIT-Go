import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.PGURL })

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/healthz', (_req, res) =>
  res.json({ ok: true, service: 'driver-service' })
)

app.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ready: true })
  } catch (e) {
    res.status(500).json({ ready: false, error: e.message })
  }
})

import drivers from './routes/drivers.js'
app.use('/v1/drivers', drivers)

app.use((req, res, next) => {
  const t0 = Date.now()
  res.on('finish', () =>
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} ${
        Date.now() - t0
      }ms`
    )
  )
  next()
})

const port = process.env.PORT || 8000
const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log(`DriverService listening on ${host}:${port}`)
  // tạm thời thêm
  console.log('PGURL=', process.env.PGURL)
})
