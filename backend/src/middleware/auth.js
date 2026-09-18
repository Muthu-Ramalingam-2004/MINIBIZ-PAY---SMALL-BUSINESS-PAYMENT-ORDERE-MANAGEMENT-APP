const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'minibiz_pay_super_secret_jwt_key_2026'

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    // For demo convenience, attach mock merchant if token missing
    req.user = { id: 'MCH-001', email: 'priya@sweettreats.com', name: 'Priya Sharma' }
    return next()
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

module.exports = { authenticateToken, JWT_SECRET }
