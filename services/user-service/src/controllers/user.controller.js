const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user.model")
const {
  recordAuthAttempt,
  recordAuthResult,
} = require("../../observability/metrics")

exports.register = async (req, res) => {
  try {
    const { fullName, name, email, password } = req.body

    if (!email || !password || !(fullName || name))
      return res.status(400).json({ error: "Missing required fields" })

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: fullName || name,
      email,
      password: hash,
    })

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: "Failed to register" })
  }
}

exports.login = async (req, res) => {
  const tStart = Date.now()
  try {
    recordAuthAttempt(req)
  } catch (e) {}
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" })

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: "Invalid credentials" })

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "uitgo_secret",
      { expiresIn: "12h" }
    )
    const duration = Date.now() - tStart
    try {
      recordAuthResult(true, duration, req)
    } catch (e) {}
    res.json({ token })
  } catch (err) {
    console.error("Login error:", err)
    const duration = Date.now() - (tStart || Date.now())
    try {
      recordAuthResult(false, duration, req)
    } catch (e) {}
    res.status(500).json({ error: "Failed to login" })
  }
}

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.sub)
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    console.error("Me error:", err)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    console.error("getUserById error:", err)
    res.status(500).json({ error: "Failed to fetch user" })
  }
}
