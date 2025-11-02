import express from 'express'
const app = express()
app.use(express.json())

app.get('/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ id, name: `User ${id}` })
})

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`UserService running on port ${PORT}`)
})
