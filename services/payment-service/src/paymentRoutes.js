const paymentController = require('./controllers/paymentController')

async function routes(fastify) {
  fastify.post('/payments', paymentController.createPayment)
  fastify.get('/payments/:id', paymentController.getPaymentById)
  fastify.post('/payments/estimate', paymentController.estimatePrice)
  fastify.post('/payments/charge', paymentController.chargeTrip)
}

module.exports = routes
