const paymentService = require('../services/paymentService');

const createPayment = async (req, reply) => {
  try {
    const payment = await paymentService.processPayment(req.body);
    reply.code(201).send(payment);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
};

const getPaymentById = async (req, reply) => {
  try {
    const payment = await paymentService.getPayment(req.params.id);
    if (!payment) {
      return reply.code(404).send({ error: 'Payment not found' });
    }
    reply.send(payment);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
};

module.exports = { createPayment, getPaymentById };
