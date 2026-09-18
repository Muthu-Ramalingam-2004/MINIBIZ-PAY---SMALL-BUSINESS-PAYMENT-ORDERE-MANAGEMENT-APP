exports.getAdminMetrics = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        totalMerchants: 240,
        totalOrders: 3420,
        totalTransactions: 5890,
        transactionVolume: 2850000,
        platformFeeRevenue: 28500,
        activeMerchants: 218,
      },
    })
  } catch (error) {
    next(error)
  }
}
