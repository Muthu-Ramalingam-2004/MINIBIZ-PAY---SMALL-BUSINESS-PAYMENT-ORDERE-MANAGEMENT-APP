const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { JWT_SECRET } = require('../middleware/auth')
const { supabase } = require('../config/supabase')
const { db, saveDb } = require('../config/db')
const supabaseService = require('../services/supabaseService')

// Secure recovery session tokens map with expiration (30 mins)
const recoveryStore = new Map()

exports.signup = async (req, res, next) => {
  try {
    const { businessName, ownerName, mobile, email, category, password } = req.body

    if (!businessName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please fill in all required signup fields.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Check duplicate email in database
    const existing = await supabaseService.getMerchantByEmail(cleanEmail)
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

    await supabaseService.saveMerchant(newMerchant)

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
    let merchant = await supabaseService.getMerchantByEmail(cleanEmail)

    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    let isPasswordValid = false
    let supabaseToken = null

    // 1. Try bcrypt password check against registered merchant record
    if (merchant && merchant.passwordHash) {
      isPasswordValid = bcrypt.compareSync(password, merchant.passwordHash)
    }

    // 2. Try Supabase Auth login if configured
    if (isSupabaseConfigured) {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (!sbError && sbData?.user) {
        isPasswordValid = true
        supabaseToken = sbData.session?.access_token

        if (!merchant) {
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
          await supabaseService.saveMerchant(merchant)
        }
      }
    }

    if (!merchant || !isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
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
    await supabaseService.saveMerchant(req.merchant)

    const { passwordHash: _, ...updatedData } = req.merchant
    res.json({ success: true, data: updatedData, message: 'Settings saved' })
  } catch (error) {
    next(error)
  }
}

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter your registered email address.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const merchant = db.merchants.find((m) => m.email.toLowerCase() === cleanEmail)

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'No account found with this email address.' })
    }

    const recoveryToken = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    recoveryStore.set(cleanEmail, { token: recoveryToken, expiresAt: Date.now() + 30 * 60 * 1000 })

    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    if (isSupabaseConfigured) {
      const host = req.get('host') || 'localhost:3000'
      const protocol = req.protocol || 'http'
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${protocol}://${host}/login?mode=reset_password&email=${encodeURIComponent(cleanEmail)}`,
      }).catch(() => {})
    }

    res.json({
      success: true,
      message: 'Account verified. You can now set your new password.',
      recoveryToken,
    })
  } catch (error) {
    next(error)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, recoveryToken } = req.body

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email and new password are required.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const merchant = db.merchants.find((m) => m.email.toLowerCase() === cleanEmail)

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Account not found for this email address.' })
    }

    // Verify recovery session
    if (recoveryToken) {
      const rec = recoveryStore.get(cleanEmail)
      if (rec && (rec.token !== recoveryToken || Date.now() > rec.expiresAt)) {
        return res.status(400).json({ success: false, error: 'Recovery session expired. Please verify your email again.' })
      }
    }

    // Update password hash
    merchant.passwordHash = bcrypt.hashSync(newPassword, 8)
    saveDb()

    recoveryStore.delete(cleanEmail)

    const isSupabaseConfigured =
      process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')

    if (isSupabaseConfigured && merchant.user_id) {
      try {
        await supabase.auth.admin.updateUserById(merchant.user_id, { password: newPassword })
      } catch (sbErr) {
        // Log error silently
      }
    }

    res.json({
      success: true,
      message: 'Password changed successfully. Please login with your new password.',
    })
  } catch (error) {
    next(error)
  }
}
