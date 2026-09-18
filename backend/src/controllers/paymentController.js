const { ordersDB } = require('./orderController')
const { bookingsDB } = require('./bookingController')
const { invoicesDB } = require('./invoiceController')

let paymentLinksDB = [
  {
    id: 'LNK-501',
    orderId: 'ORD-1001',
    customerName: 'Rahul Kumar',
    customerMobile: '+91 98765 43210',
    amount: 500,
    description: 'Advance Payment for Order #ORD-1001',
    linkUrl: 'http://localhost:3000/payment/ORD-1001',
    status: 'Paid',
    createdAt: '2026-09-17 14:30 PM',
  },
  {
    id: 'LNK-502',
    orderId: 'ORD-1001',
    customerName: 'Rahul Kumar',
    customerMobile: '+91 98765 43210',
    amount: 1000,
    description: 'Balance Payment Due for Order #ORD-1001',
    linkUrl: 'http://localhost:3000/payment/ORD-1001',
    status: 'Active',
    createdAt: '2026-09-18 10:00 AM',
  },
]

let transactionsDB = [
  {
    id: 'TXN-88201',
    orderId: 'ORD-1001',
    customerName: 'Rahul Kumar',
    amount: 500,
    paymentType: 'Advance',
    status: 'Successful',
    paymentMethod: 'UPI (GPay)',
    date: '2026-09-17 14:35 PM',
  },
]

exports.getPaymentLinks = async (req, res, next) => {
  try {
    res.json({ success: true, count: paymentLinksDB.length, data: paymentLinksDB })
  } catch (error) {
    next(error)
  }
}

exports.generatePaymentLink = async (req, res, next) => {
  try {
    const { customerName, amount, description, orderId, customerMobile } = req.body
    if (!customerName || !amount) {
      return res.status(400).json({ success: false, error: 'Customer name and amount are required' })
    }

    const targetOrderId = orderId || 'ORD-1001'
    const newLink = {
      id: `LNK-${501 + paymentLinksDB.length}`,
      orderId: targetOrderId,
      customerName,
      customerMobile: customerMobile || '+91 98765 43210',
      amount: Number(amount),
      description: description || 'Payment Request',
      linkUrl: `http://localhost:3000/payment/${targetOrderId}`,
      status: 'Active',
      createdAt: new Date().toLocaleString(),
    }

    paymentLinksDB.unshift(newLink)
    res.status(201).json({ success: true, data: newLink, message: 'Payment link generated' })
  } catch (error) {
    next(error)
  }
}

exports.processMockPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentType } = req.body
    if (!orderId || !amount) {
      return res.status(400).json({ success: false, error: 'orderId and amount are required' })
    }

    const numericAmount = Number(amount)
    const order = ordersDB.find((o) => o.id === orderId)

    // 1. Record transaction log
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId,
      customerName: order ? order.customerName : 'Customer',
      amount: numericAmount,
      paymentType: paymentType || 'Advance',
      status: 'Successful',
      paymentMethod: 'UPI (Mock Payment)',
      date: new Date().toLocaleString(),
    }
    transactionsDB.unshift(newTxn)

    // 2. Exact requirement business logic workflow:
    // When advance ₹500 paid -> Payment = Advance Paid, Order = Confirmed, Booking = Created, Calendar = Updated, Remaining = ₹1,000.
    // When balance ₹1,000 paid -> Payment = Fully Paid.
    if (order) {
      const newAdvance = paymentType === 'Full' ? order.totalAmount : order.advanceAmount + numericAmount
      order.advanceAmount = Math.min(order.totalAmount, newAdvance)
      order.balanceAmount = Math.max(0, order.totalAmount - order.advanceAmount)

      if (order.balanceAmount === 0) {
        order.paymentStatus = 'Fully Paid'
      } else if (order.advanceAmount > 0) {
        order.paymentStatus = 'Advance Paid'
      }

      // Automatically confirm order & create booking if advance paid
      if (order.orderStatus === 'Pending') {
        order.orderStatus = 'Confirmed'
      }

      // Ensure booking exists in calendar
      const existingBkg = bookingsDB.find((b) => b.orderId === order.id)
      if (!existingBkg) {
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
      } else {
        existingBkg.status = order.orderStatus
      }

      // Update matching invoice
      const matchingInv = invoicesDB.find((i) => i.orderId === order.id)
      if (matchingInv) {
        matchingInv.advanceAmount = order.advanceAmount
        matchingInv.balanceAmount = order.balanceAmount
        matchingInv.paymentStatus = order.paymentStatus
      }
    }

    // 3. Mark matching payment links as Paid
    paymentLinksDB.forEach((l) => {
      if (l.orderId === orderId) l.status = 'Paid'
    })

    res.json({
      success: true,
      data: {
        transaction: newTxn,
        order,
      },
      message: `Mock payment of ₹${numericAmount} processed successfully!`,
    })
  } catch (error) {
    next(error)
  }
}

exports.getTransactions = async (req, res, next) => {
  try {
    res.json({ success: true, count: transactionsDB.length, data: transactionsDB })
  } catch (error) {
    next(error)
  }
}

module.exports.paymentLinksDB = paymentLinksDB
module.exports.transactionsDB = transactionsDB
