let invoicesDB = [
  {
    id: 'INV-2026-001',
    orderId: 'ORD-1001',
    customerName: 'Rahul Kumar',
    customerAddress: '102 Park Avenue, Bandra West, Mumbai, 400050',
    customerMobile: '+91 98765 43210',
    customerEmail: 'rahul.k@example.com',
    productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
    totalAmount: 1500,
    advanceAmount: 500,
    balanceAmount: 1000,
    paymentStatus: 'Advance Paid',
    date: '2026-09-17',
    dueDate: '2026-09-19',
  },
  {
    id: 'INV-2026-002',
    orderId: 'ORD-1002',
    customerName: 'Ananya Roy',
    customerAddress: 'B-404 Sunshine Towers, Indiranagar, Bengaluru, 560038',
    customerMobile: '+91 98199 87654',
    customerEmail: 'ananya.roy@example.com',
    productService: 'Assorted Macarons Box (12 Pcs)',
    totalAmount: 1200,
    advanceAmount: 1200,
    balanceAmount: 0,
    paymentStatus: 'Fully Paid',
    date: '2026-09-16',
    dueDate: '2026-09-18',
  },
]

exports.getInvoices = async (req, res, next) => {
  try {
    res.json({ success: true, count: invoicesDB.length, data: invoicesDB })
  } catch (error) {
    next(error)
  }
}

exports.getInvoiceById = async (req, res, next) => {
  try {
    const inv = invoicesDB.find((i) => i.id === req.params.id || i.orderId === req.params.id)
    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invoice not found' })
    }
    res.json({ success: true, data: inv })
  } catch (error) {
    next(error)
  }
}

module.exports.invoicesDB = invoicesDB
