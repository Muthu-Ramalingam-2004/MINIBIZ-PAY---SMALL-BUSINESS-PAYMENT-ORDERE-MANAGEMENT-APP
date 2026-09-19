const { db } = require('../config/db')

exports.getReportSummary = async (req, res, next) => {
  try {
    const merchantId = req.merchant.id
    const merchantOrders = db.orders.filter((o) => o.merchantId === merchantId)
    const merchantCustomers = db.customers.filter((c) => c.merchantId === merchantId)

    const totalSales = merchantOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalCollected = merchantOrders.reduce((sum, o) => sum + o.advanceAmount, 0)
    const totalPending = merchantOrders.reduce((sum, o) => sum + o.balanceAmount, 0)
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
