const supabaseService = require('../services/supabaseService')

exports.getPaymentLinks = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const links = await supabaseService.getPaymentLinks(merchantId)
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
    const existingLinks = await supabaseService.getPaymentLinks(merchantId)
    const newLink = {
      id: `LNK-${501 + existingLinks.length}`,
      merchantId,
      orderId: targetOrderId,
      customerName: customerName.trim(),
      customerMobile: customerMobile ? customerMobile.trim() : '+91 98765 43210',
      amount: Number(amount),
      description: description ? description.trim() : 'Payment Request',
      linkUrl: `${protocol}://${host}/payment/${targetOrderId}`,
      status: 'Active',
      createdAt: new Date().toLocaleString(),
    }

    const saved = await supabaseService.savePaymentLink(newLink)
    res.status(201).json({ success: true, data: saved, message: 'Payment link generated' })
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
    // Find matching order without requiring specific merchantId (customer public checkout)
    const order = await supabaseService.getOrderById(null, orderId)
    const targetMerchantId = order ? order.merchantId : 'MCH-001'

    // 1. Record transaction log
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      merchantId: targetMerchantId,
      orderId,
      customerName: order ? order.customerName : 'Customer',
      amount: numericAmount,
      paymentType: paymentType || 'Advance',
      status: 'Successful',
      paymentMethod: 'UPI (Mock Payment)',
      date: new Date().toLocaleString(),
    }
    await supabaseService.saveTransaction(newTxn)

    // 2. Business logic updates for Order, Booking, Invoice
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

      await supabaseService.saveOrder(order)

      const existingBookings = await supabaseService.getBookings(targetMerchantId)
      const existingBkg = existingBookings.find((b) => b.orderId === order.id)
      if (!existingBkg) {
        await supabaseService.saveBooking({
          id: `BKG-${order.id}`,
          merchantId: order.merchantId,
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
      } else {
        existingBkg.status = order.orderStatus
        await supabaseService.saveBooking(existingBkg)
      }

      const existingInvoices = await supabaseService.getInvoices(targetMerchantId)
      const matchingInv = existingInvoices.find((i) => i.orderId === order.id)
      if (matchingInv) {
        matchingInv.advanceAmount = order.advanceAmount
        matchingInv.balanceAmount = order.balanceAmount
        matchingInv.paymentStatus = order.paymentStatus
        await supabaseService.saveInvoice(matchingInv)
      }
    }

    // 3. Mark matching payment links as Paid
    const existingLinks = await supabaseService.getPaymentLinks(targetMerchantId)
    for (const link of existingLinks) {
      if (link.orderId === orderId) {
        link.status = 'Paid'
        await supabaseService.savePaymentLink(link)
      }
    }

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
    const txns = await supabaseService.getTransactions(merchantId)
    res.json({ success: true, count: txns.length, data: txns })
  } catch (error) {
    next(error)
  }
}

