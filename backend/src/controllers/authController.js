const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { JWT_SECRET } = require('../middleware/auth')
const { supabase } = require('../config/supabase')
const { db, saveDb } = require('../config/db')

exports.signup = async (req, res, next) => {
  try {
    const { businessName, ownerName, mobile, email, category, password } = req.body

    if (!businessName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please fill in all required signup fields.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Check duplicate email in persistent database
    const existing = db.merchants.find((m) => m.email.toLowerCase() === cleanEmail)
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      })
    }

    let supabaseUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    let supabaseToken = null

    // 2. Attempt Supabase Auth signup if configured
    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    if (isSupabaseConfigured) {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            owner_name: ownerName.trim(),
            business_name: businessName.trim(),
          },
        },
      })

      if (sbError) {
        return res.status(400).json({
          success: false,
          error: sbError.message || 'Supabase Auth signup failed.',
        })
      }

      if (sbData?.user) {
        supabaseUserId = sbData.user.id
      }
      if (sbData?.session) {
        supabaseToken = sbData.session.access_token
      }
    }

    // 3. Create persistent merchant profile
    const newMerchantId = `MCH-${String(db.merchants.length + 101).padStart(3, '0')}`
    const passwordHash = bcrypt.hashSync(password, 8)

    const newMerchant = {
      id: newMerchantId,
      user_id: supabaseUserId,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      mobile: mobile ? mobile.trim() : '',
      email: cleanEmail,
      category: category || 'Home Baker & Confectionery',
      platformFeePercent: 1.0,
      darkMode: false,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
    }

    db.merchants.push(newMerchant)
    saveDb()

    // 4. Generate JWT Token
    const token =
      supabaseToken ||
      jwt.sign(
        { id: newMerchant.id, email: newMerchant.email, name: newMerchant.ownerName },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

    const { passwordHash: _, ...merchantData } = newMerchant

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
    let merchant = db.merchants.find((m) => m.email.toLowerCase() === cleanEmail)

    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    let supabaseToken = null

    if (isSupabaseConfigured) {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (sbError || !sbData?.user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' })
      }

      supabaseToken = sbData.session?.access_token

      if (!merchant) {
        // Create merchant profile if created externally in Supabase Auth
        const newMerchantId = `MCH-${String(db.merchants.length + 101).padStart(3, '0')}`
        merchant = {
          id: newMerchantId,
          user_id: sbData.user.id,
          businessName: sbData.user.user_metadata?.business_name || 'My Business',
          ownerName: sbData.user.user_metadata?.owner_name || 'Merchant Owner',
          mobile: '',
          email: cleanEmail,
          category: 'Home Baker & Confectionery',
          platformFeePercent: 1.0,
          darkMode: false,
          passwordHash: bcrypt.hashSync(password, 8),
          createdAt: new Date().toISOString(),
        }
        db.merchants.push(merchant)
        saveDb()
      }
    } else {
      if (!merchant || !merchant.passwordHash || !bcrypt.compareSync(password, merchant.passwordHash)) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' })
      }
    }

    const token =
      supabaseToken ||
      jwt.sign(
        { id: merchant.id, email: merchant.email, name: merchant.ownerName },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

    const { passwordHash: _, ...merchantData } = merchant

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
    if (!req.merchant) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const { passwordHash: _, ...merchantData } = req.merchant
    res.json({ success: true, data: merchantData })
  } catch (error) {
    next(error)
  }
}

exports.updateMerchant = async (req, res, next) => {
  try {
    if (!req.merchant) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    Object.assign(req.merchant, req.body)
    saveDb()

    const { passwordHash: _, ...updatedData } = req.merchant
    res.json({ success: true, data: updatedData, message: 'Settings saved' })
  } catch (error) {
    next(error)
  }
}
