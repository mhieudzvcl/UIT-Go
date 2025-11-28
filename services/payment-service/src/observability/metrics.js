const { metricScope, Unit } = require('aws-embedded-metrics')

function recordPaymentAttempt(req) {
  try {
    const scoped = metricScope((metrics) => {
      // metricScope expects the handler to return a function that will be invoked.
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('PaymentAttemptCount', 1, Unit.Count)
        metrics.setProperty('Service', 'payment-service')
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
        if (req && req.method) metrics.setProperty('method', req.method)
        if (req && req.url) metrics.setProperty('path', req.url)
      }
    })
    // invoke the returned function (scoped) to emit the metric
    scoped()
  } catch (err) {
    // metrics should never crash the app
    // eslint-disable-next-line no-console
    console.error('metrics.recordPaymentAttempt error', err.message)
  }
}

function recordPaymentResult(success, durationMs, req) {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('PaymentSuccessCount', success ? 1 : 0, Unit.Count)
        metrics.putMetric(
          'PaymentDurationMs',
          typeof durationMs === 'number' ? durationMs : 0,
          Unit.Milliseconds
        )
        metrics.setProperty('Service', 'payment-service')
        metrics.setProperty('success', !!success)
        if (req && req.requestId)
          metrics.setProperty('requestId', req.requestId)
      }
    })
    scoped()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('metrics.recordPaymentResult error', err.message)
  }
}

function emitWarmupMetric() {
  try {
    const scoped = metricScope((metrics) => {
      return () => {
        metrics.setNamespace('UITGo/SLI')
        metrics.putMetric('PaymentWarmup', 1, Unit.Count)
        metrics.setProperty('Service', 'payment-service')
        metrics.setProperty('warmup', true)
      }
    })
    scoped()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('metrics.emitWarmupMetric error', err && err.message)
  }
}

module.exports = { recordPaymentAttempt, recordPaymentResult, emitWarmupMetric }
