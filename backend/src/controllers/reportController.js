const supabaseService = require('../services/supabaseService')

exports.getReportSummary = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const merchantOrders = await supabaseService.getOrders(merchantId)
    const merchantCustomers = await supabaseService.getCustomers(merchantId)

    const totalSales = merchantOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    const totalCollected = merchantOrders.reduce((sum, o) => sum + (o.advanceAmount || 0), 0)
    const totalPending = merchantOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0)
    const totalOrders = merchantOrders.length
    const totalCustomers = merchantCustomers.length

    res.json({
      success: true,
      data: {
        totalSales,
        totalCollected,
        totalPending,
        totalOrders,
        totalCustomers,
      },
    })
  } catch (error) {
    next(error)
  }
}

