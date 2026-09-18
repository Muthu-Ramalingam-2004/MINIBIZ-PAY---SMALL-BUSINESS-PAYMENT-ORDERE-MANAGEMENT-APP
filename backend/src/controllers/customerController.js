// In-Memory store initialized with realistic customers
let customersDB = [
  {
    id: 'CUST-001',
    name: 'Rahul Kumar',
    mobile: '+91 98765 43210',
    email: 'rahul.k@example.com',
    address: '102 Park Avenue, Bandra West, Mumbai, 400050',
    notes: 'Prefers less sugar. Regular customer for family birthdays.',
    totalOrders: 4,
    totalSpent: 6200,
    pendingAmount: 1000,
    lastOrderDate: '2026-09-19',
    createdAt: '2026-01-15',
  },
  {
    id: 'CUST-002',
    name: 'Ananya Roy',
    mobile: '+91 98199 87654',
    email: 'ananya.roy@example.com',
    address: 'B-404 Sunshine Towers, Indiranagar, Bengaluru, 560038',
    notes: 'Eggless pastries & vegan cupcakes preference.',
    totalOrders: 2,
    totalSpent: 3500,
    pendingAmount: 0,
    lastOrderDate: '2026-09-18',
    createdAt: '2026-03-10',
  },
  {
    id: 'CUST-003',
    name: 'Vikram Mehta',
    mobile: '+91 97654 32109',
    email: 'vikram.m@corporatedesign.in',
    address: '801 Commercial Plaza, MG Road, Pune, 411001',
    notes: 'Corporate hamper orders. Requires detailed GST invoice.',
    totalOrders: 6,
    totalSpent: 24500,
    pendingAmount: 4500,
    lastOrderDate: '2026-09-20',
    createdAt: '2025-11-20',
  },
]

exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query
    let result = [...customersDB]
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
    const customer = customersDB.find((c) => c.id === req.params.id)
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
    const { name, mobile, email, address, notes } = req.body
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: 'Name and mobile number are required' })
    }
    const newCustomer = {
      id: `CUST-${String(customersDB.length + 1).padStart(3, '0')}`,
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
    customersDB.unshift(newCustomer)
    res.status(201).json({ success: true, data: newCustomer, message: 'Customer added successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateCustomer = async (req, res, next) => {
  try {
    const index = customersDB.findIndex((c) => c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    customersDB[index] = { ...customersDB[index], ...req.body }
    res.json({ success: true, data: customersDB[index], message: 'Customer updated' })
  } catch (error) {
    next(error)
  }
}

exports.deleteCustomer = async (req, res, next) => {
  try {
    const index = customersDB.findIndex((c) => c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    const removed = customersDB.splice(index, 1)[0]
    res.json({ success: true, data: removed, message: 'Customer deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports.customersDB = customersDB
