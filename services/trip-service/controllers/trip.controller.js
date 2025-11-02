import {
  createTrip,
  getTripById,
  updateTripStatus,
} from '../models/trip.model.js'
import { findNearbyDriver } from '../services/driverService.js'
import { estimatePrice, chargeTrip } from '../services/paymentService.js'
import { verifyUser } from '../services/userService.js'

export async function createTripHandler(req, res) {
  try {
    const passenger_id = req.body.passenger_id || req.body.rider_id
    const pickup_lat = req.body.pickup_lat || req.body.pickup?.lat
    const pickup_lng = req.body.pickup_lng || req.body.pickup?.lng
    const dropoff_lat = req.body.dropoff_lat || req.body.dropoff?.lat
    const dropoff_lng = req.body.dropoff_lng || req.body.dropoff?.lng

    // validate tối thiểu
    if (
      ![passenger_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng].every(
        (v) => Number.isFinite(Number(v))
      )
    )
      return res.status(400).json({ error: 'invalid_body' })

    // phase 1: verify nhẹ
    try {
      await verifyUser(passenger_id, req.headers.authorization || '')
    } catch {}

    // tìm tài xế gần
    const nearby = await findNearbyDriver(
      Number(pickup_lat),
      Number(pickup_lng)
    )
    const driver_id = nearby?.id || null

    // estimate giá đơn giản
    const distanceKm = 5
    const price_estimate = await estimatePrice(distanceKm)

    // lưu DB
    const trip = await createTrip({
      passenger_id,
      driver_id,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      price_estimate,
    })
    return res.status(201).json(trip)
  } catch (e) {
    console.error('createTripHandler error', e)
    return res.status(500).json({ error: 'create_trip_failed' })
  }
}

export async function getTripHandler(req, res) {
  try {
    const trip = await getTripById(req.params.id)
    if (!trip) return res.status(404).json({ error: 'not_found' })
    return res.json(trip)
  } catch (e) {
    console.error('getTripHandler error', e)
    return res.status(500).json({ error: 'get_trip_failed' })
  }
}

export async function completeTripHandler(req, res) {
  try {
    const id = Number(req.params.id)
    const trip = await getTripById(id)
    if (!trip) return res.status(404).json({ error: 'not_found' })

    await chargeTrip(id, trip.price_estimate)
    const updated = await updateTripStatus(id, 'completed')
    return res.json(updated)
  } catch (e) {
    console.error('completeTripHandler error', e)
    return res.status(500).json({ error: 'complete_trip_failed' })
  }
}
