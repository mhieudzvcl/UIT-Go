require('dotenv').config();
const fastify = require('fastify')({ logger: true });

const paymentRoutes = require('./paymentRoutes');


fastify.register(require('@fastify/cors'), {

});

fastify.register(paymentRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3004, host: '0.0.0.0' });
    console.log(`PaymentService running on port ${process.env.PORT || 3004}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});
start();
