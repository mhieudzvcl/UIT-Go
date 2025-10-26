require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const paymentRoutes = require('./routes/paymentRoutes');

fastify.register(require('fastify-cors'));  // enable CORS
fastify.register(paymentRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3004 });
    console.log(`PaymentService running on port ${process.env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
