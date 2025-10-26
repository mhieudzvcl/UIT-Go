import express from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { bbox, haversineKm } from '../lib/geo.js';
import { shouldThrottle } from '../lib/throttle.js';

const router = express.Router();

const createDriverSchema = Joi.object({
  user_id: Joi.string().required(),
  full_name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  license_no: Joi.string().allow('', null)
});

router.post('/', async (req, res) => {
  const { error, value } = createDriverSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const { user_id, full_name, phone, email, license_no } = value;
  try {
    const r = await q(
      `INSERT INTO drivers(user_id, full_name, phone, email, license_no)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id) DO UPDATE SET full_name=EXCLUDED.full_name
       RETURNING *`,
      [user_id, full_name, phone, email, license_no]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await q('SELECT * FROM drivers WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// đổi trạng thái online/offline
router.patch('/:id/status', async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid('online','offline','inactive','suspended','onboarding').required()});
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const old = await q('SELECT status FROM drivers WHERE id=$1', [req.params.id]);
    if (!old.rows[0]) return res.status(404).json({ error: 'not_found' });
    const from = old.rows[0].status;

    const r = await q(
      `UPDATE drivers SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [value.status, req.params.id]
    );
    await q(
      `INSERT INTO driver_status_history(driver_id, from_status, to_status) VALUES($1,$2,$3)`,
      [req.params.id, from, value.status]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// cập nhật vị trí (throttle)
router.post('/:id/location', async (req, res) => {
  const schema = Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).optional(),
    at: Joi.date().optional()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const thr = parseInt(process.env.LOCATION_THROTTLE_MS || '3000', 10);
  if (shouldThrottle(req.params.id, thr)) {
    // chấp nhận nhưng không ghi để demo nhanh (202)
    return res.status(202).json({ ok: true, throttled: true });
  }

  try {
    const at = value.at ? new Date(value.at) : new Date();
    await q(
      `INSERT INTO driver_locations(driver_id, lat, lng, accuracy, at) VALUES($1,$2,$3,$4,$5)`,
      [req.params.id, value.lat, value.lng, value.accuracy ?? null, at]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// lấy vị trí mới nhất
router.get('/:id/location/latest', async (req, res) => {
  try {
    const r = await q(
      `SELECT lat,lng,accuracy,at FROM driver_locations WHERE driver_id=$1 ORDER BY at DESC LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'no_location' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// tìm tài xế gần (đơn giản)
router.get('/', async (req, res) => {
  const { status, near, radius_km } = req.query;
  if (near) {
    const [latS,lngS] = String(near).split(',').map(Number);
    const radius = Number(radius_km || 3);
    const { minLat, maxLat, minLng, maxLng } = bbox(latS, lngS, radius);
    try {
      // lấy vị trí gần đây (trong 30 phút) để demo
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
      );

      const rows = r.rows
        .map(x => ({ ...x, distance_km: haversineKm(latS, lngS, x.lat, x.lng) }))
        .filter(x => x.distance_km <= radius)
        .sort((a,b) => a.distance_km - b.distance_km);

      return res.json(rows);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  } else {
    try {
      const r = await q(
        `SELECT id, full_name, status, avg_rating, total_rides FROM drivers
         WHERE ($1::text IS NULL OR status=$1)
         ORDER BY id DESC LIMIT 100`,
        [status || null]
      );
      res.json(r.rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

export default router;
