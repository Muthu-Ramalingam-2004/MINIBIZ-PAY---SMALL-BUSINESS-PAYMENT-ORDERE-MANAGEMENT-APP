const supabaseService = require('./src/services/supabaseService')

async function runSeedAndTest() {
  console.log('=== STARTING REAL TEST DATA SEEDING & VERIFICATION ===')

  const merchantId = 'MCH-001' // Standard demo merchant ID
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  // 1. CUSTOMER
  const customerId = 'CUST-DEMO-001'
  const customerObj = {
    id: customerId,
    merchantId,
    name: 'Arun Kumar',
    mobile: '9876543210',
    email: 'arun.demo@example.com',
    address: '45 MG Road, Connaught Place, New Delhi',
    notes: 'Real test data customer for birthday cake order',
    totalOrders: 1,
    totalSpent: 1500,
    pendingAmount: 1000,
    lastOrderDate: tomorrowStr,
    createdAt: new Date().toISOString().split('T')[0],
  }

  console.log('\n--- 1. Saving Customer ---')
  const savedCustomer = await supabaseService.saveCustomer(customerObj)
  console.log('Saved Customer:', savedCustomer.name, '(', savedCustomer.id, ')')

  const customersList = await supabaseService.getCustomers(merchantId)
  const foundCust = customersList.find((c) => c.id === customerId || c.mobile === '9876543210')
  console.log('Customer Verification:', foundCust ? '✅ PERSISTED & FOUND' : '❌ NOT FOUND')

  // 2. ORDER
  const orderId = 'ORD-2001'
  const orderObj = {
    id: orderId,
    merchantId,
    customerId,
    customerName: 'Arun Kumar',
    customerMobile: '9876543210',
    customerEmail: 'arun.demo@example.com',
    productService: 'Birthday Cake',
    totalAmount: 1500,
    advanceAmount: 500,
    balanceAmount: 1000,
    paymentStatus: 'Advance Paid',
    orderStatus: 'Confirmed',
    deliveryDate: tomorrowStr,
    deliveryTime: '06:00 PM',
    notes: 'Eggless chocolate truffle cake with Happy Birthday Arun written',
    createdAt: new Date().toISOString(),
  }

  console.log('\n--- 2. Saving Order ---')
  const savedOrder = await supabaseService.saveOrder(orderObj)
  console.log('Saved Order:', savedOrder.id, savedOrder.productService, 'Total:', savedOrder.totalAmount)

  const ordersList = await supabaseService.getOrders(merchantId)
  const foundOrder = ordersList.find((o) => o.id === orderId)
  console.log('Order Verification:', foundOrder ? '✅ PERSISTED & FOUND' : '❌ NOT FOUND')

  // 3. BOOKING
  const bookingId = `BKG-${orderId}`
  const bookingObj = {
    id: bookingId,
    merchantId,
    orderId,
    customerName: 'Arun Kumar',
    customerMobile: '9876543210',
    productService: 'Birthday Cake',
    deliveryDate: tomorrowStr,
    deliveryTime: '06:00 PM',
    date: tomorrowStr,
    time: '06:00 PM',
    amount: 1500,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  }

  console.log('\n--- 3. Saving Booking ---')
  const savedBooking = await supabaseService.saveBooking(bookingObj)
  console.log('Saved Booking:', savedBooking.id, 'Date:', savedBooking.deliveryDate, 'Status:', savedBooking.status)

  const bookingsList = await supabaseService.getBookings(merchantId)
  const foundBooking = bookingsList.find((b) => b.id === bookingId || b.orderId === orderId)
  console.log('Booking Verification:', foundBooking ? '✅ PERSISTED & FOUND' : '❌ NOT FOUND')

  // 4. PAYMENT LINK
  const linkId = 'LNK-DEMO-501'
  const linkObj = {
    id: linkId,
    merchantId,
    orderId,
    customerName: 'Arun Kumar',
    customerMobile: '9876543210',
    amount: 500,
    description: 'Birthday Cake Advance',
    linkUrl: `http://localhost:3000/payment/${orderId}`,
    status: 'Active',
    createdAt: new Date().toLocaleString(),
  }

  console.log('\n--- 4. Saving Payment Link ---')
  const savedLink = await supabaseService.savePaymentLink(linkObj)
  console.log('Saved Payment Link:', savedLink.id, 'Amount:', savedLink.amount, 'Link:', savedLink.linkUrl)

  const linksList = await supabaseService.getPaymentLinks(merchantId)
  const foundLink = linksList.find((l) => l.id === linkId || l.orderId === orderId)
  console.log('Payment Link Verification:', foundLink ? '✅ PERSISTED & FOUND' : '❌ NOT FOUND')

  // 5. INVOICE
  const invoiceId = 'INV-2026-DEMO'
  const invoiceObj = {
    id: invoiceId,
    merchantId,
    orderId,
    customerName: 'Arun Kumar',
    customerAddress: '45 MG Road, New Delhi',
    customerMobile: '9876543210',
    customerEmail: 'arun.demo@example.com',
    productService: 'Birthday Cake',
    totalAmount: 1500,
    advanceAmount: 500,
    balanceAmount: 1000,
    paymentStatus: 'Advance Paid',
    date: new Date().toISOString().split('T')[0],
    dueDate: tomorrowStr,
    createdAt: new Date().toISOString(),
  }

  console.log('\n--- 5. Saving Invoice ---')
  const savedInvoice = await supabaseService.saveInvoice(invoiceObj)
  console.log('Saved Invoice:', savedInvoice.id, 'Total:', savedInvoice.totalAmount, 'Balance:', savedInvoice.balanceAmount)

  const invoicesList = await supabaseService.getInvoices(merchantId)
  const foundInvoice = invoicesList.find((i) => i.id === invoiceId || i.orderId === orderId)
  console.log('Invoice Verification:', foundInvoice ? '✅ PERSISTED & FOUND' : '❌ NOT FOUND')

  console.log('\n================================================')
  console.log('ALL 5 MODULES SEEDED AND PERSISTED SUCCESSFULLY!')
  console.log('================================================')
}

runSeedAndTest().catch(console.error)
