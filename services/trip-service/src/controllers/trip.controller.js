import { createTrip, getTripById, updateTripStatus } from '../models/trip.model.js';
import { verifyUser } from '../services/userService.js';
import { findNearbyDriver } from '../services/driverService.js';
import { estimatePrice, chargeTrip } from '../services/paymentService.js';

export async function createTripHandler(req, res) {
  try {
    const passenger_id = req.user.sub;
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } = req.body;

    // 1️⃣ verify user
    await verifyUser(passenger_id, req.headers.authorization);

    // 2️⃣ tìm tài xế gần nhất
    const driver = await findNearbyDriver(pickup_lat, pickup_lng);

    // 3️⃣ tạm tính quãng đường (km)
    const distance_km = 5; // demo
    const price = await estimatePrice(distance_km);

    // 4️⃣ tạo trip
    const trip = await createTrip({
      passenger_id,
      driver_id: driver.id,
      pickup_lat, pickup_lng,
      dropoff_lat, dropoff_lng,
      price_estimate: price
    });

    res.json({ trip, driver });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function completeTripHandler(req, res) {
  try {
    const { id } = req.params;
    const trip = await updateTripStatus(id, 'completed');
    await chargeTrip(id, trip.price_estimate);
    res.json({ message: 'Trip completed and charged', trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getTripHandler(req, res) {
  const trip = await getTripById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Not found' });
  res.json(trip);
}
