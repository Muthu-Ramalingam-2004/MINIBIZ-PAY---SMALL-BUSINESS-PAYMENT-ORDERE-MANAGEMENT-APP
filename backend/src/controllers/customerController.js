const supabaseService = require('../services/supabaseService')

exports.getCustomers = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { search } = req.query
    let result = await supabaseService.getCustomers(merchantId)

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(s) ||
          (c.mobile || '').includes(s) ||
          (c.email || '').toLowerCase().includes(s)
      )
    }
    res.json({ success: true, count: result.length, data: result })
  } catch (error) {
    next(error)
  }
}

exports.getCustomerById = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const customer = await supabaseService.getCustomerById(merchantId, req.params.id)
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    res.json({ success: true, data: customer })
  } catch (error) {
    next(error)
  }
}

exports.createCustomer = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { name, mobile, email, address, notes } = req.body
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: 'Name and mobile number are required' })
    }
    const existingList = await supabaseService.getCustomers(merchantId)
    const newCustomer = {
      id: `CUST-${String(existingList.length + 1).padStart(3, '0')}`,
      merchantId,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      totalOrders: 0,
      totalSpent: 0,
      pendingAmount: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    }

    const saved = await supabaseService.saveCustomer(newCustomer)
    res.status(201).json({ success: true, data: saved, message: 'Customer added successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateCustomer = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const existing = await supabaseService.getCustomerById(merchantId, req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    const updated = { ...existing, ...req.body, merchantId }
    const saved = await supabaseService.saveCustomer(updated)
    res.json({ success: true, data: saved, message: 'Customer updated' })
  } catch (error) {
    next(error)
  }
}

exports.deleteCustomer = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const removed = await supabaseService.deleteCustomer(merchantId, req.params.id)
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    res.json({ success: true, data: removed, message: 'Customer deleted' })
  } catch (error) {
    next(error)
  }
}

