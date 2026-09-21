const supabaseService = require('../services/supabaseService')

exports.getInvoices = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const invoices = await supabaseService.getInvoices(merchantId)
    res.json({ success: true, count: invoices.length, data: invoices })
  } catch (error) {
    next(error)
  }
}

exports.createInvoice = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const { orderId, customerName, customerAddress, customerMobile, customerEmail, productService, totalAmount, advanceAmount = 0, dueDate } = req.body

    if (!customerName || !productService || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Customer name, product/service, and total amount are required' })
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

    const existingInvoices = await supabaseService.getInvoices(merchantId)
    const invoiceId = `INV-2026-${String(existingInvoices.length + 1).padStart(3, '0')}`

    const newInvoice = {
      id: invoiceId,
      merchantId,
      orderId: orderId || null,
      customerName: customerName.trim(),
      customerAddress: customerAddress ? customerAddress.trim() : '',
      customerMobile: customerMobile ? customerMobile.trim() : '+91 98765 43210',
      customerEmail: customerEmail ? customerEmail.trim() : '',
      productService: productService.trim(),
      totalAmount: total,
      advanceAmount: advance,
      balanceAmount: balance,
      paymentStatus: payStatus,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }

    const saved = await supabaseService.saveInvoice(newInvoice)
    res.status(201).json({ success: true, data: saved, message: 'Invoice generated successfully' })
  } catch (error) {
    next(error)
  }
}

exports.getInvoiceById = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const inv = await supabaseService.getInvoiceById(merchantId, req.params.id)
    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invoice not found' })
    }
    res.json({ success: true, data: inv })
  } catch (error) {
    next(error)
  }
}



