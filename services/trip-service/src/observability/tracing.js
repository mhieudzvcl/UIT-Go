// Minimal OpenTelemetry initializer (optional)
export function initTracing(serviceName = 'trip-service') {
  // optional lazy initialization without top-level await
  try {
    import('@opentelemetry/sdk-node')
      .then(({ NodeSDK }) =>
        import('@opentelemetry/auto-instrumentations-node').then(
          ({ getNodeAutoInstrumentations }) => {
            const sdk = new NodeSDK({
              instrumentations: [getNodeAutoInstrumentations()],
            })
            sdk
              .start()
              .then(() =>
                console.log('OpenTelemetry initialized for', serviceName)
              )
              .catch(() => console.warn('OpenTelemetry start failed'))
          }
        )
      )
      .catch(() =>
        console.warn('OpenTelemetry packages not installed - tracing disabled')
      )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Tracing not initialized (optional)')
  }
}
