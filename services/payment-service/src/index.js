require('dotenv').config()
const fastify = require('fastify')({ logger: true })

fastify.register(require('@fastify/cors'), {})

fastify.post('/payments/estimate', async (req, reply) => {
  const { distance_km } = req.body || {}
  const amount = Number(distance_km || 0) * 10000
  return reply.send({ amount })
})

fastify.post('/payments/charge', async (req, reply) => {
  const { trip_id, amount } = req.body || {}
  return reply.send({ trip_id, amount, status: 'charged' })
})

// (giữ file paymentRoutes nếu bạn muốn, không bắt buộc cho demo)

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3004, host: '0.0.0.0' })
    console.log(`PaymentService running on port ${process.env.PORT || 3004}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
