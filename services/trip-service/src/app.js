import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import tripRoutes from './routes/trips.js'
import pool from './db.js'
import observabilityMiddleware from './observability/plugin.js'
import { emitWarmupMetric } from './observability/metrics.js'
import { initTracing } from './observability/tracing.js'

dotenv.config()
const app = express()
app.use(cors())
// Capture raw JSON body (for debugging malformed JSON) using the `verify` option
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      try {
        req.rawBody = buf.toString(encoding || 'utf8')
      } catch (e) {
        req.rawBody = undefined
      }
    },
  })
)

// JSON parse error handler: body-parser throws a SyntaxError on invalid JSON.
// Catch it early and return a clear JSON error while logging details for debugging.
app.use((err, req, res, next) => {
  if (
    err &&
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    console.error('[app] JSON parse error on request:', {
      path: req.path,
      method: req.method,
      rawError: err.message,
      rawBody: req.rawBody,
    })
    return res.status(400).json({
      error: 'invalid_body',
      message: 'Malformed JSON in request body',
    })
  }
  next(err)
})
// init tracing (optional)
initTracing('trip-service')

// warmup EMF
try {
  emitWarmupMetric()
} catch (e) {
  console.warn('Warmup metric failed (non-fatal)')
}

// observability middleware
app.use(observabilityMiddleware)

app.get('/healthz', (_, res) => res.json({ status: 'ok' }))
app.use('/trips', tripRoutes)

// DB connection is handled in `src/db.js` (pool created and connected there when DB_URL is set).
if (!process.env.DB_URL) {
  console.log('Database connection skipped (set DB_URL to enable)')
}

app.listen(process.env.PORT, () => {
  console.log(`TripService running on port ${process.env.PORT}`)
})
