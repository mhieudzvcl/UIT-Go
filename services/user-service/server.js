import express from 'express'
import observabilityMiddleware from './src/observability/plugin.js'
import { emitWarmupMetric } from './src/observability/metrics.js'
import { initTracing } from './src/observability/tracing.js'

const app = express()
app.use(express.json())

// init tracing (optional)
initTracing('user-service')

try {
  emitWarmupMetric()
} catch (e) {
  console.warn('Warmup metric failed')
}

app.use(observabilityMiddleware)

app.get('/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ id, name: `User ${id}` })
})

app.get('/healthz', (_, res) => res.json({ status: 'ok' }))
app.listen(3000, () => console.log('UserService running on port 3000'))
