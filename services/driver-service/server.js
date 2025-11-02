import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import driverRoutes from './routes/drivers.js'
import { pool } from './src/db.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/healthz', (_, res) => res.json({ status: 'ok' }))
app.use('/drivers', driverRoutes)

// DB connect log
pool
  .connect()
  .then(() => console.log('Driver DB connected'))
  .catch((e) => console.error('Driver DB error', e))

const PORT = process.env.PORT || 8002
app.listen(PORT, '0.0.0.0', () => console.log(`DriverService on ${PORT}`))
