import express from 'express'
import dotenv from 'dotenv'
import driversRouter from './routes/drivers.js'
import { pool } from './db.js'
import { randomUUID } from 'crypto'
import { initTracing } from './tracing.js'

dotenv.config()

// init tracing (will no-op if OTel packages missing)
initTracing('driver-service')

const app = express()
app.use(express.json())

// basic requestId + timing logger
app.use((req, res, next) => {
  const rid =
    req.headers['x-request-id'] ||
    req.headers['x_request_id'] ||
    randomUUID().slice(0, 8)
  const start = Date.now()
  req.requestId = rid
  res.on('finish', () => {
    const duration = Date.now() - start
    console.info(
      JSON.stringify({
        msg: 'http_request_complete',
        service: 'driver-service',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        requestId: rid,
      })
    )
  })
  next()
})

// healthcheck
app.get('/healthz', (_, res) => res.json({ status: 'ok' }))

// driver APIs backed by Postgres
app.use('/drivers', driversRouter)

const PORT = process.env.PORT || 8000

// verify DB connection on boot
pool
  .connect()
  .then((client) => {
    client.release()
    console.log('Driver DB connected')
  })
  .catch((err) => {
    console.error('Driver DB connection failed', err)
  })

app.listen(PORT, () => console.log(`DriverService running on port ${PORT}`))
