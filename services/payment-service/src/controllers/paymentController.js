const paymentService = require('../services/paymentService')
const {
  recordPaymentAttempt,
  recordPaymentResult,
} = require('../observability/metrics')

const createPayment = async (req, reply) => {
  const tStart = Date.now()
  try {
    req.log.info({ step: 'start_createPayment', requestId: req.requestId })
  } catch (e) {}

  try {
    recordPaymentAttempt(req)
  } catch (e) {}

  try {
    const payment = await paymentService.processPayment(req.body)
    const duration = Date.now() - tStart
    recordPaymentResult(true, duration, req)
    try {
      req.log.info({
        step: 'after_processPayment',
        totalMs: duration,
        requestId: req.requestId,
      })
    } catch (e) {}
    reply.code(201).send(payment)
  } catch (err) {
    const duration = Date.now() - tStart
    recordPaymentResult(false, duration, req)
    try {
      req.log.info({
        step: 'on_error',
        totalMs: duration,
        error: err && err.message,
        requestId: req.requestId,
      })
    } catch (e) {}
    reply.code(500).send({ error: err.message })
  }
}

const getPaymentById = async (req, reply) => {
  try {
    const payment = await paymentService.getPayment(req.params.id)
    if (!payment) {
      return reply.code(404).send({ error: 'Payment not found' })
    }
    reply.send(payment)
  } catch (err) {
    reply.code(500).send({ error: err.message })
  }
}

const estimatePrice = async (req, reply) => {
  try {
    const amount = await paymentService.estimatePrice(req.body?.distance_km)
    reply.send({ amount })
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

const chargeTrip = async (req, reply) => {
  try {
    const payment = await paymentService.chargeTrip(
      req.body?.trip_id,
      req.body?.amount,
      req.body?.user_id
    )
    reply.code(201).send(payment)
  } catch (err) {
    reply.code(400).send({ error: err.message })
  }
}

module.exports = { createPayment, getPaymentById, estimatePrice, chargeTrip }
