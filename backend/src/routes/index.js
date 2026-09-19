const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const customerController = require('../controllers/customerController')
const orderController = require('../controllers/orderController')
const paymentController = require('../controllers/paymentController')
const bookingController = require('../controllers/bookingController')
const invoiceController = require('../controllers/invoiceController')
const reportController = require('../controllers/reportController')
const adminController = require('../controllers/adminController')
const { authenticateToken } = require('../middleware/auth')

// 1. Auth & Merchant Routes
router.post('/auth/signup', authController.signup)
router.post('/auth/login', authController.login)
router.get('/auth/me', authenticateToken, authController.getMe)
router.put('/auth/merchant', authenticateToken, authController.updateMerchant)
router.post('/auth/forgot-password/request', authController.requestPasswordReset)
router.post('/auth/forgot-password/reset', authController.resetPassword)

// 2. Customers Routes
router.get('/customers', authenticateToken, customerController.getCustomers)
router.post('/customers', authenticateToken, customerController.createCustomer)
router.get('/customers/:id', authenticateToken, customerController.getCustomerById)
router.put('/customers/:id', authenticateToken, customerController.updateCustomer)
router.delete('/customers/:id', authenticateToken, customerController.deleteCustomer)

// 3. Orders Routes
router.get('/orders', authenticateToken, orderController.getOrders)
router.post('/orders', authenticateToken, orderController.createOrder)
router.get('/orders/:id', authenticateToken, orderController.getOrderById)
router.patch('/orders/:id/status', authenticateToken, orderController.updateOrderStatus)
router.delete('/orders/:id', authenticateToken, orderController.deleteOrder)

// 4. Payments & Mock Gateway Routes
router.get('/payments/links', authenticateToken, paymentController.getPaymentLinks)
router.post('/payments/generate-link', authenticateToken, paymentController.generatePaymentLink)
router.post('/payments/mock-pay', paymentController.processMockPayment) // Public customer mock checkout
router.get('/payments/transactions', authenticateToken, paymentController.getTransactions)

// 5. Bookings Routes
router.get('/bookings', authenticateToken, bookingController.getBookings)
router.put('/bookings/:id', authenticateToken, bookingController.updateBooking)

// 6. Invoices Routes
router.get('/invoices', authenticateToken, invoiceController.getInvoices)
router.get('/invoices/:id', authenticateToken, invoiceController.getInvoiceById)

// 7. Reports Routes
router.get('/reports/summary', authenticateToken, reportController.getReportSummary)

// 8. Admin Routes
router.get('/admin/metrics', authenticateToken, adminController.getAdminMetrics)

module.exports = router
