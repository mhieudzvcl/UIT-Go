const paymentController = require('./controllers/paymentController');

async function routes(fastify) {
  fastify.post('/payments', paymentController.createPayment);
  fastify.get('/payments/:id', paymentController.getPaymentById);
}

module.exports = routes;
