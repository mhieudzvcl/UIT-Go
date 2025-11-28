require('dotenv').config()
const fastify = require('fastify')({ logger: true })

const paymentRoutes = require('./paymentRoutes')

// observability plugin & tracing
const observabilityPlugin = require('./observability/plugin')
const { initTracing } = require('./observability/tracing')
const { emitWarmupMetric } = require('./observability/metrics')

// initialize tracing (no-op if not configured)
initTracing('payment-service')

// emit a warmup metric to avoid first-request EMF initialization overhead
try {
  emitWarmupMetric()
} catch (e) {
  // non-fatal
  console.warn('Warmup metric failed (non-fatal)')
}

fastify.register(require('@fastify/cors'), {})

// register observability plugin early so hooks run for all routes
fastify.register(observabilityPlugin)

fastify.register(paymentRoutes)

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
