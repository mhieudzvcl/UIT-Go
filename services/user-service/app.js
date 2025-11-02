const express = require('express')
const dotenv = require('dotenv')
const sequelize = require('./src/config/db')

dotenv.config()
const app = express()
app.use(express.json())

// Test endpoint
app.get('/', (req, res) => {
  res.send('UserService is running 🚀')
})

// Import router
const userRoutes = require('./src/routes/user.route')
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 8000

// Đồng bộ DB và khởi động server
sequelize
  .sync()
  .then(() => {
    console.log('✅ Database synced!')
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ Sync DB failed:', err)
  })

module.exports = app
