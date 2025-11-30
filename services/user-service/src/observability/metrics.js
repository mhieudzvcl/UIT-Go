import { metricScope, Unit } from 'aws-embedded-metrics'

export function recordAuthAttempt(req) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('LoginAttemptCount', 1, Unit.Count)
        metrics.setProperty('Service', 'user-service')
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    console.error('metrics.recordAuthAttempt error', err && err.message)
  }
}

export function recordAuthResult(success, durationMs, req) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('LoginSuccessCount', success ? 1 : 0, Unit.Count)
        metrics.putMetric(
          'LoginDurationMs',
          typeof durationMs === 'number' ? durationMs : 0,
          Unit.Milliseconds
        )
        metrics.setProperty('Service', 'user-service')
        metrics.setProperty('success', !!success)
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    console.error('metrics.recordAuthResult error', err && err.message)
  }
}

export function emitWarmupMetric() {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('LoginWarmup', 1, Unit.Count)
        metrics.setProperty('Service', 'user-service')
        metrics.setProperty('warmup', true)
      }
    })
    scoped()
  } catch (err) {
    console.error('metrics.emitWarmupMetric error', err && err.message)
  }
}
