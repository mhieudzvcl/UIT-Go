import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import trips from '../routes/trips.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/healthz', async (_, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch {
    res.status(500).json({ status: 'db_error' })
  }
})

app.use('/trips', trips)

const PORT = process.env.PORT || 8082
app.listen(PORT, '0.0.0.0', () => console.log(`TripService running on ${PORT}`))
