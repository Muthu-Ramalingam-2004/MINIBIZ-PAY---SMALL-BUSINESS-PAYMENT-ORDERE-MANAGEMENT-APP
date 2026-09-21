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

