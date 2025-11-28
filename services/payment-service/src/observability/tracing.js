// Minimal tracing initializer stub. This file attempts to initialize OpenTelemetry Node SDK
// if the packages are installed and environment variables configured. If not, it falls
// back to a no-op so it won't crash the service.

function initTracing(serviceName = 'payment-service') {
  try {
    // Lazy require so service can run without OTel packages if not installed
    // (install @opentelemetry/sdk-node and exporters when ready)
    const { NodeSDK } = require('@opentelemetry/sdk-node')
    const {
      getNodeAutoInstrumentations,
    } = require('@opentelemetry/auto-instrumentations-node')
    // optional: configure OTLP exporter via OTEL_EXPORTER_OTLP_ENDPOINT env var
    const sdk = new NodeSDK({
      traceExporter: undefined, // leave to environment or explicit setup
      instrumentations: [getNodeAutoInstrumentations()],
    })
    sdk
      .start()
      .then(() => console.log('OpenTelemetry initialized'))
      .catch((err) =>
        console.error('OpenTelemetry failed to start', err && err.message)
      )
  } catch (err) {
    // If packages are not installed, do nothing. This keeps runtime safe.
    // eslint-disable-next-line no-console
    console.warn(
      'Tracing not initialized (optional). To enable tracing, install OpenTelemetry packages.'
    )
  }
}

module.exports = { initTracing }
