import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pkg from 'pg'

const { Pool } = pkg
const pool = new Pool({
  connectionString:
    process.env.PGURL || 'postgres://postgres:password@db:5432/userdb',
})

const app = express()
app.use(cors())
app.use(express.json())

app.get('/healthz', async (_, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch {
    res.status(500).json({ status: 'db_error' })
  }
})

/** POST /users  { email, password, full_name, role } */
app.post('/users', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body || {}
    if (!email || !password || !full_name)
      return res.status(400).json({ error: 'invalid_body' })

    const hash = await bcrypt.hash(String(password), 10)
    const { rows } = await pool.query(
      `INSERT INTO users(email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name, role, created_at`,
      [email, hash, full_name, role || 'rider']
    )
    if (!rows[0]) {
      // email đã tồn tại → trả thông tin cơ bản để Phase 1 tiếp tục được
      const existed = await pool.query(
        'SELECT id, email, full_name, role, created_at FROM users WHERE email=$1',
        [email]
      )
      return res.status(200).json(existed.rows[0])
    }
    res.status(201).json(rows[0])
  } catch (e) {
    console.error('POST /users', e)
    res.status(500).json({ error: 'create_user_failed' })
  }
})

/** POST /sessions  { email, password } -> { token } */
app.post('/sessions', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password)
      return res.status(400).json({ error: 'invalid_body' })

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email=$1',
      [email]
    )
    const u = rows[0]
    if (!u) return res.status(401).json({ error: 'invalid_credentials' })

    const ok = await bcrypt.compare(String(password), u.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })

    const token = jwt.sign(
      { sub: u.id, email: u.email, role: u.role },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '12h' }
    )
    res.json({ token })
  } catch (e) {
    console.error('POST /sessions', e)
    res.status(500).json({ error: 'login_failed' })
  }
})

/** GET /users/me  (Bearer token) */
app.get('/users/me', async (req, res) => {
  try {
    const hdr = req.headers.authorization || ''
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!token) return res.status(401).json({ error: 'no_token' })

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret')
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id=$1',
      [payload.sub]
    )
    if (!rows[0]) return res.status(404).json({ error: 'not_found' })
    res.json(rows[0])
  } catch (e) {
    console.error('GET /users/me', e)
    res.status(401).json({ error: 'invalid_token' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log(`UserService on ${PORT}`))
