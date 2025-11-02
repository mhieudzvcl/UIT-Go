import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// ⚠️ routes và db nằm ở root → phải import đi lên 1 cấp
import driverRoutes from '../routes/drivers.js'
import { pool } from './db.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.get('/healthz', (_, res) => res.json({ status: 'ok' }))

// mount router thật
app.use('/drivers', driverRoutes)

// Kết nối DB (không thoát app nếu lỗi, chỉ log)
pool
  .connect()
  .then(() => console.log('✅ DB connected'))
  .catch((err) => console.error('❌ DB error', err))

const PORT = process.env.PORT || 8002
app.listen(PORT, '0.0.0.0', () =>
  console.log(`DriverService running on ${PORT}`)
)
