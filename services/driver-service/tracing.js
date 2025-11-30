// Minimal OpenTelemetry initializer for driver-service (optional if OTel deps missing)
export async function initTracing(serviceName = 'driver-service') {
  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    )
    const sdk = new NodeSDK({
      serviceName,
      instrumentations: [getNodeAutoInstrumentations()],
    })
    await sdk.start()
    console.log('OpenTelemetry initialized for', serviceName)
  } catch (err) {
    console.warn('Tracing not initialized (optional):', err?.message || err)
  }
}
