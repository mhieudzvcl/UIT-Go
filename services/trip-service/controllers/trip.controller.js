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
    const { passenger_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } =
      req.body

    // 1) Verify user (demo: bỏ qua token strict)
    try {
      await verifyUser(passenger_id, req.headers.authorization || '')
    } catch {}

    // 2) tìm tài xế gần
    const nearby = await findNearbyDriver(pickup_lat, pickup_lng)
    const driver_id = nearby?.id || null

    // 3) ước tính giá
    const distanceKm = 5 // đơn giản hoá demo
    const price_estimate = await estimatePrice(distanceKm)

    // 4) lưu trip
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
    const id = req.params.id
    const trip = await getTripById(id)
    if (!trip) return res.status(404).json({ error: 'not_found' })

    // charge
    await chargeTrip(id, trip.price_estimate)
    const updated = await updateTripStatus(id, 'completed')

    return res.json(updated)
  } catch (e) {
    console.error('completeTripHandler error', e)
    return res.status(500).json({ error: 'complete_trip_failed' })
  }
}
