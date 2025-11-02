import express from 'express'
import Joi from 'joi'
import { q } from '../src/db.js'
import { bbox, haversineKm } from '../lib/geo.js'
import { shouldThrottle } from '../lib/throttle.js'

const router = express.Router()

// /drivers/search?lat=&lng=&radius_km=&status=
router.get('/search', async (req, res) => {
  const schema = Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    radius_km: Joi.number().min(0.1).default(3),
    status: Joi.string()
      .valid('online', 'offline', 'inactive', 'suspended', 'onboarding')
      .optional(),
  })
  const { error, value } = schema.validate({
    lat: Number(req.query.lat),
    lng: Number(req.query.lng),
    radius_km: req.query.radius_km ? Number(req.query.radius_km) : undefined,
    status: req.query.status,
  })
  if (error) return res.status(400).json({ error: error.message })

  const { lat, lng, radius_km, status } = value
  const { minLat, maxLat, minLng, maxLng } = bbox(lat, lng, radius_km)

  try {
    const r = await q(
      `
      SELECT d.id, d.full_name, d.status, loc.lat, loc.lng, loc.at
      FROM drivers d
      JOIN LATERAL (
        SELECT lat,lng,at FROM driver_locations l
        WHERE l.driver_id = d.id AND l.at > now() - interval '30 minutes'
        ORDER BY at DESC LIMIT 1
      ) loc ON TRUE
      WHERE ($1::text IS NULL OR d.status=$1)
        AND loc.lat BETWEEN $2 AND $3
        AND loc.lng BETWEEN $4 AND $5
      LIMIT 50
    `,
      [status || null, minLat, maxLat, minLng, maxLng]
    )

    const rows = r.rows
      .map((x) => ({ ...x, distance_km: haversineKm(lat, lng, x.lat, x.lng) }))
      .filter((x) => x.distance_km <= radius_km)
      .sort((a, b) => a.distance_km - b.distance_km)

    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Tạo tài xế
router.post('/', async (req, res) => {
  const schema = Joi.object({
    user_id: Joi.string().required(),
    full_name: Joi.string().required(),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    license_no: Joi.string().allow('', null),
  })
  const { error, value } = schema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })

  try {
    const r = await q(
      `
      INSERT INTO drivers(user_id, full_name, phone, email, license_no)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (user_id) DO UPDATE SET
        full_name=EXCLUDED.full_name,
        phone=EXCLUDED.phone,
        email=EXCLUDED.email,
        license_no=EXCLUDED.license_no
      RETURNING *
    `,
      [
        value.user_id,
        value.full_name,
        value.phone,
        value.email,
        value.license_no,
      ]
    )
    res.json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Đổi trạng thái
router.patch('/:id/status', async (req, res) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('online', 'offline', 'inactive', 'suspended', 'onboarding')
      .required(),
  })
  const { error, value } = schema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })

  const id = Number(req.params.id)
  if (!Number.isInteger(id))
    return res.status(400).json({ error: 'invalid_id' })

  try {
    const old = await q('SELECT status FROM drivers WHERE id=$1', [id])
    if (!old.rows[0]) return res.status(404).json({ error: 'not_found' })
    const from = old.rows[0].status

    const r = await q(
      `UPDATE drivers SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [value.status, id]
    )
    await q(
      `INSERT INTO driver_status_history(driver_id, from_status, to_status) VALUES ($1,$2,$3)`,
      [id, from, value.status]
    )
    res.json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Cập nhật vị trí
router.post('/:id/location', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id))
    return res.status(400).json({ error: 'invalid_id' })

  const schema = Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).optional(),
    at: Joi.date().optional(),
  })
  const { error, value } = schema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })

  const thr = parseInt(process.env.LOCATION_THROTTLE_MS || '3000', 10)
  if (shouldThrottle(String(id), thr)) {
    return res.status(202).json({ ok: true, throttled: true })
  }

  try {
    const at = value.at ? new Date(value.at) : new Date()
    await q(
      `INSERT INTO driver_locations(driver_id, lat, lng, accuracy, at) VALUES ($1,$2,$3,$4,$5)`,
      [id, value.lat, value.lng, value.accuracy ?? null, at]
    )
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Vị trí mới nhất
router.get('/:id/location/latest', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id))
    return res.status(400).json({ error: 'invalid_id' })
  try {
    const r = await q(
      `SELECT lat,lng,accuracy,at FROM driver_locations WHERE driver_id=$1 ORDER BY at DESC LIMIT 1`,
      [id]
    )
    if (!r.rows[0]) return res.status(404).json({ error: 'no_location' })
    res.json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
// LIST / SEARCH: /drivers?near=lat,lng&radius_km=3&status=online
router.get('/', async (req, res) => {
  const { near, radius_km, status } = req.query

  // Có near=lat,lng -> tìm tài xế gần
  if (near) {
    const [latS, lngS] = String(near).split(',').map(Number)
    if (!Number.isFinite(latS) || !Number.isFinite(lngS)) {
      return res.status(400).json({ error: 'invalid_near' })
    }
    const radius = Number(radius_km || 3)
    const { minLat, maxLat, minLng, maxLng } = bbox(latS, lngS, radius)
    try {
      const r = await q(
        `
        SELECT d.id, d.full_name, d.status, loc.lat, loc.lng, loc.at
        FROM drivers d
        JOIN LATERAL (
          SELECT lat,lng,at FROM driver_locations l
          WHERE l.driver_id = d.id AND l.at > now() - interval '30 minutes'
          ORDER BY at DESC LIMIT 1
        ) loc ON TRUE
        WHERE ($1::text IS NULL OR d.status=$1)
          AND loc.lat BETWEEN $2 AND $3
          AND loc.lng BETWEEN $4 AND $5
        LIMIT 50
        `,
        [status || null, minLat, maxLat, minLng, maxLng]
      )

      const rows = r.rows
        .map((x) => ({
          ...x,
          distance_km: haversineKm(latS, lngS, x.lat, x.lng),
        }))
        .filter((x) => x.distance_km <= radius)
        .sort((a, b) => a.distance_km - b.distance_km)

      return res.json(rows)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // Không có near -> trả danh sách theo status
  try {
    const r = await q(
      `SELECT id, full_name, status, avg_rating, total_rides
       FROM drivers
       WHERE ($1::text IS NULL OR status=$1)
       ORDER BY id DESC
       LIMIT 100`,
      [status || null]
    )
    res.json(r.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
// Chi tiết theo id (ĐỂ CUỐI)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id))
      return res.status(400).json({ error: 'invalid_id' })
    const r = await q('SELECT * FROM drivers WHERE id=$1', [id])
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' })
    res.json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
