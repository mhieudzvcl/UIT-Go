import express from 'express'
const app = express()
app.use(express.json())

// ✨ Healthz cho PaymentService
app.get('/healthz', (_, res) => res.json({ status: 'ok' }))

// (các route sẵn có)
app.post('/payments/estimate', (req, res) => {
  const { distance_km } = req.body || {}
  const km = Number(distance_km || 0)
  const price = Math.max(15000, Math.round(km * 10000)) // ví dụ: 10k/km, min 15k
  return res.json({ price, currency: 'VND' })
})

const PORT = process.env.PORT || 3004
app.listen(PORT, '0.0.0.0', () =>
  console.log(`PaymentService running on ${PORT}`)
)
