const { bookingsDB } = require('./bookingController')
const { invoicesDB } = require('./invoiceController')

let ordersDB = [
  {
    id: 'ORD-1001',
    customerId: 'CUST-001',
    customerName: 'Rahul Kumar',
    customerMobile: '+91 98765 43210',
    customerEmail: 'rahul.k@example.com',
    productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
    totalAmount: 1500,
    advanceAmount: 500,
    balanceAmount: 1000,
    paymentStatus: 'Advance Paid',
    orderStatus: 'Confirmed',
    deliveryDate: '2026-09-19',
    deliveryTime: '10:30 AM',
    notes: 'Blue buttercream frosting with "Happy 10th Birthday Arav" written.',
    createdAt: '2026-09-17T14:30:00Z',
  },
  {
    id: 'ORD-1002',
    customerId: 'CUST-002',
    customerName: 'Ananya Roy',
    customerMobile: '+91 98199 87654',
    customerEmail: 'ananya.roy@example.com',
    productService: 'Assorted Macarons Box (12 Pcs)',
    totalAmount: 1200,
    advanceAmount: 1200,
    balanceAmount: 0,
    paymentStatus: 'Fully Paid',
    orderStatus: 'Delivered',
    deliveryDate: '2026-09-18',
    deliveryTime: '04:00 PM',
    notes: 'Ribbon box packaging.',
    createdAt: '2026-09-16T11:00:00Z',
  },
  {
    id: 'ORD-1003',
    customerId: 'CUST-003',
    customerName: 'Vikram Mehta',
    customerMobile: '+91 97654 32109',
    customerEmail: 'vikram.m@corporatedesign.in',
    productService: 'Corporate Snack & Cookie Gift Baskets (x10)',
    totalAmount: 12500,
    advanceAmount: 8000,
    balanceAmount: 4500,
    paymentStatus: 'Advance Paid',
    orderStatus: 'Preparing',
    deliveryDate: '2026-09-20',
    deliveryTime: '11:00 AM',
    notes: 'Company logo tags to be attached on each basket.',
    createdAt: '2026-09-15T09:15:00Z',
  },
]

exports.getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search } = req.query
    let result = [...ordersDB]

    if (status && status !== 'all') {
      result = result.filter((o) => o.orderStatus === status)
    }
    if (paymentStatus && paymentStatus !== 'all') {
      result = result.filter((o) => o.paymentStatus === paymentStatus)
    }
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.customerName.toLowerCase().includes(s) ||
          o.productService.toLowerCase().includes(s)
      )
    }

    res.json({ success: true, count: result.length, data: result })
  } catch (error) {
    next(error)
  }
}

exports.getOrderById = async (req, res, next) => {
  try {
    const order = ordersDB.find((o) => o.id === req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

exports.createOrder = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerMobile,
      customerEmail,
      productService,
      totalAmount,
      advanceAmount = 0,
      orderStatus = 'Pending',
      deliveryDate,
      deliveryTime = '10:30 AM',
      notes,
    } = req.body

    if (!customerName || !productService || !totalAmount || !deliveryDate) {
      return res.status(400).json({ success: false, error: 'Missing required order fields' })
    }

    const total = Number(totalAmount)
    const advance = Number(advanceAmount)
    const balance = Math.max(0, total - advance)

    let payStatus = 'Unpaid'
    if (total > 0 && advance >= total) {
      payStatus = 'Fully Paid'
    } else if (advance > 0) {
      payStatus = 'Advance Paid'
    }

    const orderId = `ORD-${1001 + ordersDB.length}`
    const newOrder = {
      id: orderId,
      customerId: customerId || `CUST-${Date.now()}`,
      customerName,
      customerMobile: customerMobile || '+91 98765 43210',
      customerEmail: customerEmail || '',
      productService,
      totalAmount: total,
      advanceAmount: advance,
      balanceAmount: balance,
      paymentStatus: payStatus,
      orderStatus,
      deliveryDate,
      deliveryTime,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    }

    ordersDB.unshift(newOrder)

    // Auto-create Booking if Confirmed
    if (orderStatus === 'Confirmed') {
      bookingsDB.unshift({
        id: `BKG-${orderId}`,
        orderId: newOrder.id,
        customerName: newOrder.customerName,
        customerMobile: newOrder.customerMobile,
        productService: newOrder.productService,
        date: newOrder.deliveryDate,
        time: newOrder.deliveryTime,
        amount: newOrder.totalAmount,
        status: newOrder.orderStatus,
      })
    }

    // Auto-create Invoice
    invoicesDB.unshift({
      id: `INV-2026-${String(invoicesDB.length + 1).padStart(3, '0')}`,
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      customerAddress: newOrder.customerEmail,
      customerMobile: newOrder.customerMobile,
      customerEmail: newOrder.customerEmail,
      productService: newOrder.productService,
      totalAmount: newOrder.totalAmount,
      advanceAmount: newOrder.advanceAmount,
      balanceAmount: newOrder.balanceAmount,
      paymentStatus: newOrder.paymentStatus,
      date: new Date().toISOString().split('T')[0],
      dueDate: newOrder.deliveryDate,
    })

    res.status(201).json({ success: true, data: newOrder, message: 'Order created successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const order = ordersDB.find((o) => o.id === req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    order.orderStatus = status

    // Sync booking status
    const booking = bookingsDB.find((b) => b.orderId === order.id)
    if (booking) {
      booking.status = status
    } else if (status === 'Confirmed') {
      bookingsDB.unshift({
        id: `BKG-${order.id}`,
        orderId: order.id,
        customerName: order.customerName,
        customerMobile: order.customerMobile,
        productService: order.productService,
        date: order.deliveryDate,
        time: order.deliveryTime,
        amount: order.totalAmount,
        status: order.orderStatus,
      })
    }

    res.json({ success: true, data: order, message: `Order status changed to ${status}` })
  } catch (error) {
    next(error)
  }
}

exports.deleteOrder = async (req, res, next) => {
  try {
    const index = ordersDB.findIndex((o) => o.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    const removed = ordersDB.splice(index, 1)[0]
    res.json({ success: true, data: removed, message: 'Order deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports.ordersDB = ordersDB
