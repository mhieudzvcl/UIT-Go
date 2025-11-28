const paymentModel = require('../models/paymentModel')

// simple fare rules (could be fetched from config)
const BASE_FARE = 5000
const PER_KM = 8000

function calculateAmount(distance_km) {
  const dist = Number(distance_km)
  if (Number.isNaN(dist) || dist <= 0) throw new Error('Invalid distance_km')
  return Math.round(BASE_FARE + dist * PER_KM)
}

const processPayment = async (data) => {
  if (!data || typeof data.amount === 'undefined')
    throw new Error('amount is required')

  // persist to Postgres
  const created = await paymentModel.createPayment({
    tripId: data.tripId ?? data.trip_id,
    userId: data.userId ?? data.user_id,
    driverId: data.driverId ?? data.driver_id ?? null,
    amount: data.amount,
    currency: data.currency || 'VND',
    paymentMethod: data.paymentMethod || 'card',
  })
  return created
}

const estimatePrice = async (distance_km) => calculateAmount(distance_km)

const chargeTrip = async (trip_id, amount, user_id) => {
  if (!trip_id) throw new Error('trip_id is required')
  const chargeAmount = typeof amount === 'number' ? amount : calculateAmount(1)
  return processPayment({ amount: chargeAmount, tripId: trip_id, userId: user_id })
}

const getPayment = async (id) => paymentModel.getPaymentById(id)

module.exports = { processPayment, getPayment, estimatePrice, chargeTrip }
