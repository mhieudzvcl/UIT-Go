// Fastify plugin to add request id, timing, and structured logging hooks
module.exports = async function observabilityPlugin(fastify, opts) {
  fastify.addHook('onRequest', async (request, reply) => {
    // set a requestId if client did not provide one
    const incoming =
      request.headers['x-request-id'] || request.headers['x_request_id']
    request.requestId =
      incoming || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    request.requestStartTime = Date.now()
  })

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - (request.requestStartTime || Date.now())
    // use fastify logger (enabled in src/index.js)
    try {
      fastify.log.info({
        msg: 'http_request_complete',
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration,
        requestId: request.requestId,
      })
    } catch (err) {
      // don't crash on logging errors
      // eslint-disable-next-line no-console
      console.error('observability plugin log error', err && err.message)
    }
  })
}
