import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { pool } from './src/index.js'
import paymentRoutes from './src/paymentRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/healthz', (_, res) => res.json({ status: 'ok' }))
app.use('/payments', paymentRoutes)

const PORT = process.env.PORT || 3004
app.listen(PORT, '0.0.0.0', () => console.log(`PaymentService on ${PORT}`))
