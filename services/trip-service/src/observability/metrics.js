import { metricScope, Unit } from 'aws-embedded-metrics'

export function recordBookingAttempt(req) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('BookingAttemptCount', 1, Unit.Count)
        metrics.setProperty('Service', 'trip-service')
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    // non-fatal
    // eslint-disable-next-line no-console
    console.error('metrics.recordBookingAttempt error', err && err.message)
  }
}

export function recordBookingResult(success, durationMs, req) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('BookingSuccessCount', success ? 1 : 0, Unit.Count)
        metrics.putMetric(
          'BookingDurationMs',
          typeof durationMs === 'number' ? durationMs : 0,
          Unit.Milliseconds
        )
        metrics.setProperty('Service', 'trip-service')
        metrics.setProperty('success', !!success)
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('metrics.recordBookingResult error', err && err.message)
  }
}

// Track driver match latency (p95 SLO target 200ms)
export function recordMatchLatency(durationMs, req, success = true) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric(
          'MatchLatencyMs',
          typeof durationMs === 'number' ? durationMs : 0,
          Unit.Milliseconds
        )
        metrics.putMetric('MatchAttemptCount', 1, Unit.Count)
        metrics.putMetric('MatchSuccessCount', success ? 1 : 0, Unit.Count)
        metrics.setProperty('Service', 'trip-service')
        metrics.setProperty('success', !!success)
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    console.error('metrics.recordMatchLatency error', err && err.message)
  }
}

export function emitWarmupMetric() {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('BookingWarmup', 1, Unit.Count)
        metrics.setProperty('Service', 'trip-service')
        metrics.setProperty('warmup', true)
      }
    })
    scoped()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('metrics.emitWarmupMetric error', err && err.message)
  }
}
