const express = require('express')
const cors = require('cors')
require('dotenv').config()

const routes = require('./routes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api', routes)

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'MiniBiz Pay Backend REST API', timestamp: new Date() })
})

// Global Error Handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 MiniBiz Pay Backend REST API running on port ${PORT}`)
})

module.exports = app
