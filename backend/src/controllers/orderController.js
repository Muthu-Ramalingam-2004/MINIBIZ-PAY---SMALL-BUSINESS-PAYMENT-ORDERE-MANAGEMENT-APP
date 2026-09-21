const supabaseService = require('../services/supabaseService')

exports.getOrders = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { status, paymentStatus, search } = req.query
    let result = await supabaseService.getOrders(merchantId)

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
          (o.id || '').toLowerCase().includes(s) ||
          (o.customerName || '').toLowerCase().includes(s) ||
          (o.productService || '').toLowerCase().includes(s)
      )
    }

    res.json({ success: true, count: result.length, data: result })
  } catch (error) {
    next(error)
  }
}

exports.getOrderById = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const order = await supabaseService.getOrderById(merchantId, req.params.id)
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
    const merchantId = req.merchant.id
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

    const existingOrders = await supabaseService.getOrders(merchantId)
    const orderId = `ORD-${1001 + existingOrders.length}`
    const newOrder = {
      id: orderId,
      merchantId,
      customerId: customerId || `CUST-${Date.now()}`,
      customerName: customerName.trim(),
      customerMobile: customerMobile ? customerMobile.trim() : '+91 98765 43210',
      customerEmail: customerEmail ? customerEmail.trim() : '',
      productService: productService.trim(),
      totalAmount: total,
      advanceAmount: advance,
      balanceAmount: balance,
      paymentStatus: payStatus,
      orderStatus,
      deliveryDate,
      deliveryTime,
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
    }

    await supabaseService.saveOrder(newOrder)

    // Auto-create Booking if Confirmed
    if (orderStatus === 'Confirmed') {
      await supabaseService.saveBooking({
        id: `BKG-${orderId}`,
        merchantId,
        orderId: newOrder.id,
        customerName: newOrder.customerName,
        customerMobile: newOrder.customerMobile,
        productService: newOrder.productService,
        date: newOrder.deliveryDate,
        time: newOrder.deliveryTime,
        deliveryDate: newOrder.deliveryDate,
        deliveryTime: newOrder.deliveryTime,
        amount: newOrder.totalAmount,
        status: newOrder.orderStatus,
        createdAt: new Date().toISOString(),
      })
    }

    // Auto-create Invoice
    const existingInvoices = await supabaseService.getInvoices(merchantId)
    await supabaseService.saveInvoice({
      id: `INV-2026-${String(existingInvoices.length + 1).padStart(3, '0')}`,
      merchantId,
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
      createdAt: new Date().toISOString(),
    })

    res.status(201).json({ success: true, data: newOrder, message: 'Order created successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { status } = req.body
    const order = await supabaseService.getOrderById(merchantId, req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    order.orderStatus = status
    await supabaseService.saveOrder(order)

    // Sync booking status
    const existingBookings = await supabaseService.getBookings(merchantId)
    const booking = existingBookings.find((b) => b.orderId === order.id)
    if (booking) {
      booking.status = status
      await supabaseService.saveBooking(booking)
    } else if (status === 'Confirmed') {
      await supabaseService.saveBooking({
        id: `BKG-${order.id}`,
        merchantId,
        orderId: order.id,
        customerName: order.customerName,
        customerMobile: order.customerMobile,
        productService: order.productService,
        date: order.deliveryDate,
        time: order.deliveryTime,
        deliveryDate: order.deliveryDate,
        deliveryTime: order.deliveryTime,
        amount: order.totalAmount,
        status: order.orderStatus,
        createdAt: new Date().toISOString(),
      })
    }

    res.json({ success: true, data: order, message: `Order status changed to ${status}` })
  } catch (error) {
    next(error)
  }
}

exports.deleteOrder = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const removed = await supabaseService.deleteOrder(merchantId, req.params.id)
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    res.json({ success: true, data: removed, message: 'Order deleted' })
  } catch (error) {
    next(error)
  }
}

