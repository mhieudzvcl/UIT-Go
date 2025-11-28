const express = require("express")
const dotenv = require("dotenv")
const sequelize = require("./config/db")
const observabilityMiddleware = require("../observability/plugin").default || require("../observability/plugin")
const { emitWarmupMetric } = require("../observability/metrics")
const { initTracing } = require("../observability/tracing")

dotenv.config()
const app = express()
app.use(express.json())

// healthcheck
app.get("/", (req, res) => {
  res.send("UserService is running")
})

const userRoutes = require("./routes/user.route")
const sessionRoutes = require("./routes/session.route")

// init tracing (optional/no-op if not installed)
initTracing("user-service")
try {
  emitWarmupMetric()
} catch (e) {
  console.warn("Warmup metric failed")
}
app.use(observabilityMiddleware)

app.use("/api/users", userRoutes)
app.use("/api/sessions", sessionRoutes)

const PORT = process.env.PORT || 3000

sequelize
  .sync()
  .then(() => {
    console.log("Database synced")
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error("Sync DB failed:", err)
  })

module.exports = app
