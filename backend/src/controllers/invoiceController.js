const { db } = require('../config/db')

exports.getInvoices = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const invoices = db.invoices.filter((i) => i.merchantId === merchantId)
    res.json({ success: true, count: invoices.length, data: invoices })
  } catch (error) {
    next(error)
  }
}

exports.getInvoiceById = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const inv = db.invoices.find(
      (i) => (i.id === req.params.id || i.orderId === req.params.id) && i.merchantId === merchantId
    )
    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invoice not found' })
    }
    res.json({ success: true, data: inv })
  } catch (error) {
    next(error)
  }
}
