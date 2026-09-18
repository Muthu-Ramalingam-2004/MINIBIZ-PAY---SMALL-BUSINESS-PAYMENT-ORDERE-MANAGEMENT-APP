const { ordersDB } = require('./orderController')
const { customersDB } = require('./customerController')

exports.getReportSummary = async (req, res, next) => {
  try {
    const totalSales = ordersDB.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalCollected = ordersDB.reduce((sum, o) => sum + o.advanceAmount, 0)
    const totalPending = ordersDB.reduce((sum, o) => sum + o.balanceAmount, 0)
    const totalOrders = ordersDB.length
    const totalCustomers = customersDB.length

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
