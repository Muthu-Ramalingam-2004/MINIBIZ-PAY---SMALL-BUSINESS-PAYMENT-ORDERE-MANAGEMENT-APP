const { db, saveDb } = require('../config/db')

exports.getPaymentLinks = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const links = db.paymentLinks.filter((l) => l.merchantId === merchantId)
    res.json({ success: true, count: links.length, data: links })
  } catch (error) {
    next(error)
  }
}

exports.generatePaymentLink = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { customerName, amount, description, orderId, customerMobile } = req.body
    if (!customerName || !amount) {
      return res.status(400).json({ success: false, error: 'Customer name and amount are required' })
    }

    const targetOrderId = orderId || 'ORD-1001'
    const host = req.get('host') || 'localhost:3000'
    const protocol = req.protocol || 'http'
    const newLink = {
      id: `LNK-${501 + db.paymentLinks.length}`,
      merchantId,
      orderId: targetOrderId,
      customerName,
      customerMobile: customerMobile || '+91 98765 43210',
      amount: Number(amount),
      description: description || 'Payment Request',
      linkUrl: `${protocol}://${host}/payment/${targetOrderId}`,
      status: 'Active',
      createdAt: new Date().toLocaleString(),
    }

    db.paymentLinks.unshift(newLink)
    saveDb()

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
    const order = db.orders.find((o) => o.id === orderId)

    // 1. Record transaction log
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      merchantId: order ? order.merchantId : 'MCH-001',
      orderId,
      customerName: order ? order.customerName : 'Customer',
      amount: numericAmount,
      paymentType: paymentType || 'Advance',
      status: 'Successful',
      paymentMethod: 'UPI (Mock Payment)',
      date: new Date().toLocaleString(),
    }
    db.transactions.unshift(newTxn)

    // 2. Business logic updates
    if (order) {
      const newAdvance = paymentType === 'Full' ? order.totalAmount : order.advanceAmount + numericAmount
      order.advanceAmount = Math.min(order.totalAmount, newAdvance)
      order.balanceAmount = Math.max(0, order.totalAmount - order.advanceAmount)

      if (order.balanceAmount === 0) {
        order.paymentStatus = 'Fully Paid'
      } else if (order.advanceAmount > 0) {
        order.paymentStatus = 'Advance Paid'
      }

      if (order.orderStatus === 'Pending') {
        order.orderStatus = 'Confirmed'
      }

      const existingBkg = db.bookings.find((b) => b.orderId === order.id && b.merchantId === order.merchantId)
      if (!existingBkg) {
        db.bookings.unshift({
          id: `BKG-${order.id}`,
          merchantId: order.merchantId,
          orderId: order.id,
          customerName: order.customerName,
          customerMobile: order.customerMobile,
          productService: order.productService,
          date: order.deliveryDate,
          time: order.deliveryTime,
          amount: order.totalAmount,
          status: order.orderStatus,
          createdAt: new Date().toISOString(),
        })
      } else {
        existingBkg.status = order.orderStatus
      }

      const matchingInv = db.invoices.find((i) => i.orderId === order.id && i.merchantId === order.merchantId)
      if (matchingInv) {
        matchingInv.advanceAmount = order.advanceAmount
        matchingInv.balanceAmount = order.balanceAmount
        matchingInv.paymentStatus = order.paymentStatus
      }
    }

    // 3. Mark matching payment links as Paid
    db.paymentLinks.forEach((l) => {
      if (l.orderId === orderId) l.status = 'Paid'
    })

    saveDb()

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
    const merchantId = req.merchant.id
    const txns = db.transactions.filter((t) => t.merchantId === merchantId)
    res.json({ success: true, count: txns.length, data: txns })
  } catch (error) {
    next(error)
  }
}
