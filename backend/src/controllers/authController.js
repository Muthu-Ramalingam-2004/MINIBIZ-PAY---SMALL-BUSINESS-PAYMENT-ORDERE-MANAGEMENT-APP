const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { JWT_SECRET } = require('../middleware/auth')

// In-memory demo store fallback
const merchantsDB = [
  {
    id: 'MCH-001',
    businessName: 'Sweet Treats Bakery & Crafts',
    ownerName: 'Priya Sharma',
    mobile: '+91 98200 12345',
    email: 'priya@sweettreats.com',
    category: 'Home Baker & Confectionery',
    platformFeePercent: 1.0,
    darkMode: false,
    passwordHash: bcrypt.hashSync('password123', 8),
  },
]

exports.signup = async (req, res, next) => {
  try {
    const { businessName, ownerName, mobile, email, category, password } = req.body

    if (!businessName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please fill in all required signup fields.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const existing = merchantsDB.find((m) => m.email.toLowerCase() === cleanEmail)
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      })
    }

    const newMerchant = {
      id: `MCH-${String(merchantsDB.length + 1).padStart(3, '0')}`,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      mobile: mobile ? mobile.trim() : '',
      email: cleanEmail,
      category: category || 'Home Baker & Confectionery',
      platformFeePercent: 1.0,
      darkMode: false,
      passwordHash: bcrypt.hashSync(password, 8),
    }

    merchantsDB.push(newMerchant)

    const token = jwt.sign(
      { id: newMerchant.id, email: newMerchant.email, name: newMerchant.ownerName },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { passwordHash, ...merchantData } = newMerchant

    res.status(201).json({
      success: true,
      data: { token, merchant: merchantData },
      message: 'Account created successfully',
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both email and password.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const merchant = merchantsDB.find((m) => m.email.toLowerCase() === cleanEmail)

    if (!merchant || !bcrypt.compareSync(password, merchant.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      { id: merchant.id, email: merchant.email, name: merchant.ownerName },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { passwordHash, ...merchantData } = merchant

    res.json({
      success: true,
      data: { token, merchant: merchantData },
      message: 'Login successful',
    })
  } catch (error) {
    next(error)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id
    const userEmail = req.user?.email

    let merchant = null
    if (userId) {
      merchant = merchantsDB.find((m) => m.id === userId)
    }
    if (!merchant && userEmail) {
      merchant = merchantsDB.find((m) => m.email.toLowerCase() === userEmail.toLowerCase())
    }

    if (!merchant) {
      merchant = merchantsDB[merchantsDB.length - 1] || merchantsDB[0]
    }

    const { passwordHash, ...merchantData } = merchant
    res.json({ success: true, data: merchantData })
  } catch (error) {
    next(error)
  }
}

exports.updateMerchant = async (req, res, next) => {
  try {
    const userId = req.user?.id
    const userEmail = req.user?.email

    let merchant = merchantsDB.find(
      (m) => m.id === userId || (userEmail && m.email.toLowerCase() === userEmail.toLowerCase())
    ) || merchantsDB[merchantsDB.length - 1]

    Object.assign(merchant, req.body)
    const { passwordHash, ...updatedData } = merchant
    res.json({ success: true, data: updatedData, message: 'Settings saved' })
  } catch (error) {
    next(error)
  }
}

module.exports.merchantsDB = merchantsDB
