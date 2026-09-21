const supabaseService = require('../services/supabaseService')

exports.getBookings = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { status, filter } = req.query
    let result = await supabaseService.getBookings(merchantId)

    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      result = result.filter((b) => b.deliveryDate === today || b.date === today)
    } else if (filter === 'upcoming') {
      result = result.filter((b) => b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready')
    } else if (filter === 'completed') {
      result = result.filter((b) => b.status === 'Completed' || b.status === 'Delivered')
    } else if (filter === 'cancelled') {
      result = result.filter((b) => b.status === 'Cancelled')
    }

    res.json({ success: true, count: result.length, data: result })
  } catch (error) {
    next(error)
  }
}

exports.createBooking = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { orderId, customerName, customerMobile, productService, deliveryDate, deliveryTime, amount, status } = req.body

    if (!customerName || !productService || !deliveryDate) {
      return res.status(400).json({ success: false, error: 'Customer name, product/service, and delivery date are required' })
    }

    const existingBookings = await supabaseService.getBookings(merchantId)
    const bookingId = `BKG-${String(existingBookings.length + 1001)}`
    const newBooking = {
      id: bookingId,
      merchantId,
      orderId: orderId || null,
      customerName: customerName.trim(),
      customerMobile: customerMobile ? customerMobile.trim() : '+91 98765 43210',
      productService: productService.trim(),
      deliveryDate,
      deliveryTime: deliveryTime || '10:30 AM',
      date: deliveryDate,
      time: deliveryTime || '10:30 AM',
      amount: Number(amount || 0),
      status: status || 'Confirmed',
      createdAt: new Date().toISOString(),
    }

    const saved = await supabaseService.saveBooking(newBooking)
    res.status(201).json({ success: true, data: saved, message: 'Booking created successfully' })
  } catch (error) {
    next(error)
  }
}

exports.updateBooking = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const existingBookings = await supabaseService.getBookings(merchantId)
    const booking = existingBookings.find(
      (b) => b.id === req.params.id || b.orderId === req.params.id
    )
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const updated = { ...booking, ...req.body, merchantId }
    const saved = await supabaseService.saveBooking(updated)
    res.json({ success: true, data: saved, message: 'Booking updated' })
  } catch (error) {
    next(error)
  }
}

