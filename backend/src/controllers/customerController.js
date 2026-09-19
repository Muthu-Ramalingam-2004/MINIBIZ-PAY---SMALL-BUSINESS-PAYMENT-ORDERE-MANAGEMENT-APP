const { db, saveDb } = require('../config/db')

exports.getCustomers = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { search } = req.query
    let result = db.customers.filter((c) => c.merchantId === merchantId)

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(s) || c.mobile.includes(s) || (c.email && c.email.toLowerCase().includes(s))
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
    const customer = db.customers.find((c) => c.id === req.params.id && c.merchantId === merchantId)
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
    const newCustomer = {
      id: `CUST-${String(db.customers.length + 1).padStart(3, '0')}`,
      merchantId,
      name,
      mobile,
      email: email || '',
      address: address || '',
      notes: notes || '',
      totalOrders: 0,
      totalSpent: 0,
      pendingAmount: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    }
    db.customers.unshift(newCustomer)
    saveDb()
    res.status(201).json({ success: true, data: newCustomer, message: 'Customer added successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateCustomer = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const index = db.customers.findIndex((c) => c.id === req.params.id && c.merchantId === merchantId)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    db.customers[index] = { ...db.customers[index], ...req.body }
    saveDb()
    res.json({ success: true, data: db.customers[index], message: 'Customer updated' })
  } catch (error) {
    next(error)
  }
}

exports.deleteCustomer = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const index = db.customers.findIndex((c) => c.id === req.params.id && c.merchantId === merchantId)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    const removed = db.customers.splice(index, 1)[0]
    saveDb()
    res.json({ success: true, data: removed, message: 'Customer deleted' })
  } catch (error) {
    next(error)
  }
}
