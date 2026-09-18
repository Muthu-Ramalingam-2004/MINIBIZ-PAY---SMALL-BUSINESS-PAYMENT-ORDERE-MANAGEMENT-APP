let bookingsDB = [
  {
    id: 'BKG-ORD-1001',
    orderId: 'ORD-1001',
    customerName: 'Rahul Kumar',
    customerMobile: '+91 98765 43210',
    productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
    date: '2026-09-19',
    time: '10:30 AM',
    amount: 1500,
    status: 'Confirmed',
  },
  {
    id: 'BKG-ORD-1003',
    orderId: 'ORD-1003',
    customerName: 'Vikram Mehta',
    customerMobile: '+91 97654 32109',
    productService: 'Corporate Snack & Cookie Gift Baskets (x10)',
    date: '2026-09-20',
    time: '11:00 AM',
    amount: 12500,
    status: 'Preparing',
  },
]

exports.getBookings = async (req, res, next) => {
  try {
    const { status, filter } = req.query
    let result = [...bookingsDB]

    if (filter === 'today') {
      result = result.filter((b) => b.date === '2026-09-19' || b.date === new Date().toISOString().split('T')[0])
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

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = bookingsDB.find((b) => b.id === req.params.id || b.orderId === req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    Object.assign(booking, req.body)
    res.json({ success: true, data: booking, message: 'Booking updated' })
  } catch (error) {
    next(error)
  }
}

module.exports.bookingsDB = bookingsDB
