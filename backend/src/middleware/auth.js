const jwt = require('jsonwebtoken')
const { supabase } = require('../config/supabase')
const { db } = require('../config/db')

const JWT_SECRET = process.env.JWT_SECRET || 'minibiz_pay_super_secret_jwt_key_2026_prod'

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' })
    }

    let decodedUser = null

    // 1. Try Supabase Auth token verification if Supabase configured
    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data?.user) {
        decodedUser = {
          id: data.user.id,
          email: data.user.email,
        }
      }
    }

    // 2. Try JWT verification
    if (!decodedUser) {
      try {
        decodedUser = jwt.verify(token, JWT_SECRET)
      } catch (jwtErr) {
        return res.status(401).json({ success: false, error: 'Invalid or expired session token. Please log in again.' })
      }
    }

    if (!decodedUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized access.' })
    }

    const supabaseService = require('../services/supabaseService')

    // Lookup matching merchant in persistent storage
    const cleanEmail = (decodedUser.email || '').toLowerCase()
    let merchant = db.merchants.find(
      (m) => m.id === decodedUser.id || m.user_id === decodedUser.id || (cleanEmail && m.email.toLowerCase() === cleanEmail)
    )

    if (!merchant && cleanEmail) {
      merchant = await supabaseService.getMerchantByEmail(cleanEmail)
    }

    if (!merchant) {
      return res.status(401).json({ success: false, error: 'Merchant profile not found for authenticated user.' })
    }

    req.user = decodedUser
    req.merchant = {
      ...merchant,
      id: supabaseService.toValidUuid(merchant.id),
    }
    next()
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Authentication error: ' + error.message })
  }
}

module.exports = { authenticateToken, JWT_SECRET }
