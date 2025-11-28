const { Sequelize } = require("sequelize")
require("dotenv").config()

// Prefer DB_URL (used by docker-compose) but fall back to PGURL for backward compatibility
const connectionString = process.env.DB_URL || process.env.PGURL

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
})

sequelize
  .authenticate()
  .then(() => console.log("✓ Database connected"))
  .catch((err) => console.error("✗ Database connection failed:", err))

module.exports = sequelize
