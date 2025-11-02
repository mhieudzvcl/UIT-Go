import { createPaymentModel } from '../models/paymentModel.js'

export async function createPayment(req, res) {
  try {
    const { trip_id, amount } = req.body || {}
    if (!Number.isInteger(trip_id))
      return res.status(400).json({ error: 'invalid_trip_id' })
    const money = Number(amount ?? 0)
    const row = await createPaymentModel(trip_id, money)
    return res.status(201).json({ ok: true, status: row.status, id: row.id })
  } catch (e) {
    console.error('createPayment error', e)
    return res.status(500).json({ error: 'create_payment_failed' })
  }
}
