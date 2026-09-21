const crypto = require('crypto')
const { supabase, supabaseUrl, supabaseKey } = require('../config/supabase')
const { db, saveDb } = require('../config/db')

/**
 * Converts any ID string (e.g. 'MCH-001', 'MCH-101', 'usr_123') into a valid,
 * deterministic PostgreSQL v4 UUID string (e.g. 'c6f9379c-7164-4bf1-89e4-0820f1882e75').
 * If idStr is already a valid UUID, it returns it unchanged.
 */
function toValidUuid(idStr) {
  if (!idStr) return '00000000-0000-4000-8000-000000000001'
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(idStr)) {
    return idStr
  }
  const hash = crypto.createHash('md5').update(String(idStr)).digest('hex')
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-8${hash.substring(17, 20)}-${hash.substring(20, 32)}`
}

function isSupabaseActive() {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseKey.includes('placeholder') &&
    supabase
  )
}

// ----------------------------------------------------
// FIELD MAPPERS (snake_case <-> camelCase)
// ----------------------------------------------------

function mapCustomerFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    name: row.name || '',
    mobile: row.mobile || '',
    email: row.email || '',
    address: row.address || '',
    notes: row.notes || '',
    totalOrders: Number(row.total_orders || 0),
    totalSpent: Number(row.total_spent || 0),
    pendingAmount: Number(row.pending_amount || 0),
    lastOrderDate: row.last_order_date || new Date().toISOString().split('T')[0],
    createdAt: row.created_at || new Date().toISOString().split('T')[0],
  }
}

function mapCustomerToDb(c) {
  return {
    id: c.id,
    merchant_id: toValidUuid(c.merchantId),
    name: c.name,
    mobile: c.mobile,
    email: c.email || '',
    address: c.address || '',
    notes: c.notes || '',
    total_orders: c.totalOrders || 0,
    total_spent: c.totalSpent || 0,
    pending_amount: c.pendingAmount || 0,
    last_order_date: c.lastOrderDate || new Date().toISOString().split('T')[0],
  }
}

function mapOrderFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    customerMobile: row.customer_mobile || '',
    customerEmail: row.customer_email || '',
    productService: row.product_service || '',
    totalAmount: Number(row.total_amount || 0),
    advanceAmount: Number(row.advance_amount || 0),
    balanceAmount: Number(row.balance_amount || 0),
    paymentStatus: row.payment_status || 'Unpaid',
    orderStatus: row.order_status || 'Pending',
    deliveryDate: row.delivery_date || '',
    deliveryTime: row.delivery_time || '10:30 AM',
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function mapOrderToDb(o) {
  return {
    id: o.id,
    merchant_id: toValidUuid(o.merchantId),
    customer_id: o.customerId || null,
    customer_name: o.customerName,
    customer_mobile: o.customerMobile || '',
    customer_email: o.customerEmail || '',
    product_service: o.productService,
    total_amount: o.totalAmount || 0,
    advance_amount: o.advanceAmount || 0,
    balance_amount: o.balanceAmount || 0,
    payment_status: o.paymentStatus || 'Unpaid',
    order_status: o.orderStatus || 'Pending',
    delivery_date: o.deliveryDate,
    delivery_time: o.deliveryTime || '10:30 AM',
    notes: o.notes || '',
  }
}

function mapPaymentLinkFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    orderId: row.order_id || '',
    customerName: row.customer_name || '',
    customerMobile: row.customer_mobile || '',
    amount: Number(row.amount || 0),
    description: row.description || '',
    linkUrl: row.link_url || '',
    status: row.status || 'Active',
    createdAt: row.created_at || new Date().toLocaleString(),
  }
}

function mapPaymentLinkToDb(l) {
  return {
    id: l.id,
    merchant_id: toValidUuid(l.merchantId),
    order_id: l.orderId || null,
    customer_name: l.customerName,
    customer_mobile: l.customerMobile || '',
    amount: l.amount,
    description: l.description || '',
    link_url: l.linkUrl,
    status: l.status || 'Active',
  }
}

function mapTransactionFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    orderId: row.order_id || '',
    customerName: row.customer_name || '',
    amount: Number(row.amount || 0),
    paymentType: row.payment_type || 'Advance',
    paymentMethod: row.payment_method || 'UPI (Mock Payment)',
    status: row.status || 'Successful',
    date: row.date || new Date().toLocaleString(),
  }
}

function mapTransactionToDb(t) {
  return {
    id: t.id,
    merchant_id: toValidUuid(t.merchantId),
    order_id: t.orderId || null,
    customer_name: t.customerName,
    amount: t.amount,
    payment_type: t.paymentType,
    payment_method: t.paymentMethod || 'UPI (Mock Payment)',
    status: t.status || 'Successful',
  }
}

function mapBookingFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    orderId: row.order_id || '',
    customerName: row.customer_name || '',
    customerMobile: row.customer_mobile || '',
    productService: row.product_service || '',
    deliveryDate: row.delivery_date || '',
    deliveryTime: row.delivery_time || '10:30 AM',
    date: row.delivery_date || '',
    time: row.delivery_time || '10:30 AM',
    amount: Number(row.amount || 0),
    status: row.status || 'Confirmed',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function mapBookingToDb(b) {
  return {
    id: b.id,
    merchant_id: toValidUuid(b.merchantId),
    order_id: b.orderId || null,
    customer_name: b.customerName,
    customer_mobile: b.customerMobile || '',
    product_service: b.productService,
    delivery_date: b.deliveryDate || b.date,
    delivery_time: b.deliveryTime || b.time || '10:30 AM',
    amount: b.amount,
    status: b.status || 'Confirmed',
  }
}

function mapInvoiceFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    merchantId: row.merchant_id,
    orderId: row.order_id || '',
    customerName: row.customer_name || '',
    customerAddress: row.customer_address || '',
    customerMobile: row.customer_mobile || '',
    customerEmail: row.customer_email || '',
    productService: row.product_service || '',
    totalAmount: Number(row.total_amount || 0),
    advanceAmount: Number(row.advance_amount || 0),
    balanceAmount: Number(row.balance_amount || 0),
    paymentStatus: row.payment_status || 'Unpaid',
    date: row.date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function mapInvoiceToDb(inv) {
  return {
    id: inv.id,
    merchant_id: toValidUuid(inv.merchantId),
    order_id: inv.orderId || null,
    customer_name: inv.customerName,
    customer_address: inv.customerAddress || '',
    customer_mobile: inv.customerMobile || '',
    customer_email: inv.customerEmail || '',
    product_service: inv.productService,
    total_amount: inv.totalAmount,
    advance_amount: inv.advanceAmount || 0,
    balance_amount: inv.balanceAmount || 0,
    payment_status: inv.paymentStatus,
    date: inv.date || new Date().toISOString().split('T')[0],
    due_date: inv.dueDate,
  }
}

function mapMerchantFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    businessName: row.business_name || '',
    ownerName: row.owner_name || '',
    mobile: row.mobile || '',
    email: row.email || '',
    category: row.category || 'Home Baker & Confectionery',
    platformFeePercent: Number(row.platform_fee_percent || 1.0),
    darkMode: Boolean(row.dark_mode),
    createdAt: row.created_at,
  }
}

// ----------------------------------------------------
// MERCHANT FOREIGN KEY PROTECTION HELPER
// ----------------------------------------------------

async function ensureMerchantExists(merchantId, optionalEmail = '') {
  if (!isSupabaseActive()) return
  const validUuid = toValidUuid(merchantId)
  try {
    const { data } = await supabase.from('merchants').select('id').eq('id', validUuid).single()
    if (!data) {
      await supabase.from('merchants').upsert({
        id: validUuid,
        business_name: 'MiniBiz Merchant',
        owner_name: 'Merchant Owner',
        mobile: '+91 98200 12345',
        email: optionalEmail ? optionalEmail.toLowerCase() : `merchant_${validUuid.substring(0, 8)}@minibizpay.com`,
        category: 'Home Baker & Confectionery',
        platform_fee_percent: 1.0,
        dark_mode: false,
      }).catch((e) => console.warn('[Supabase ensureMerchantExists Upsert Error]', e.message))
    }
  } catch (err) {
    console.warn('[Supabase ensureMerchantExists Check Error]', err.message || err)
  }
}

async function ensureCustomerExists(customerId, merchantId, customerName = 'Customer', customerMobile = '+91 98765 43210', customerEmail = '') {
  if (!isSupabaseActive() || !customerId) return
  try {
    const validMerchantUuid = toValidUuid(merchantId)
    const { data } = await supabase.from('customers').select('id').eq('id', customerId).single()
    if (!data) {
      await supabase.from('customers').upsert({
        id: customerId,
        merchant_id: validMerchantUuid,
        name: customerName || 'Customer',
        mobile: customerMobile || '+91 98765 43210',
        email: customerEmail || '',
        address: '',
        notes: 'Auto-created customer record',
        total_orders: 1,
        total_spent: 0.00,
        pending_amount: 0.00,
        last_order_date: new Date().toISOString().split('T')[0],
      }).catch((e) => console.warn('[Supabase ensureCustomerExists Upsert Error]', e.message))
    }
  } catch (err) {
    console.warn('[Supabase ensureCustomerExists Check Error]', err.message || err)
  }
}

// ----------------------------------------------------
// DATABASE SERVICE METHODS
// ----------------------------------------------------

// 1. CUSTOMERS
async function getCustomers(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Supabase getCustomers Error]', error.message, error.details, error.code)
      } else if (Array.isArray(data)) {
        return data.map(mapCustomerFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getCustomers Catch Error]', err)
    }
  }
  return db.customers.filter((c) => c.merchantId === merchantId)
}

async function getCustomerById(merchantId, id) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      let query = supabase.from('customers').select('*').eq('id', id)
      if (validUuid) query = query.eq('merchant_id', validUuid)
      const { data, error } = await query.single()

      if (error) {
        console.warn('[Supabase getCustomerById Error]', error.message)
      } else if (data) {
        return mapCustomerFromDb(data)
      }
    } catch (err) {
      console.warn('[Supabase getCustomerById Catch Error]', err)
    }
  }
  return db.customers.find((c) => c.id === id && (c.merchantId === merchantId || !merchantId)) || null
}

async function saveCustomer(customer) {
  const existingIndex = db.customers.findIndex((c) => c.id === customer.id)
  if (existingIndex >= 0) {
    db.customers[existingIndex] = customer
  } else {
    db.customers.unshift(customer)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(customer.merchantId)
      const dbRow = mapCustomerToDb(customer)
      const { error } = await supabase.from('customers').upsert(dbRow)
      if (error) {
        console.warn('[Supabase saveCustomer Upsert Error]', error.message, error.details, error.code)
      }
    } catch (err) {
      console.warn('[Supabase saveCustomer Catch Error]', err)
    }
  }
  return customer
}

async function deleteCustomer(merchantId, id) {
  const index = db.customers.findIndex((c) => c.id === id && c.merchantId === merchantId)
  let removed = null
  if (index >= 0) {
    removed = db.customers.splice(index, 1)[0]
    saveDb()
  }

  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { error } = await supabase.from('customers').delete().eq('id', id).eq('merchant_id', validUuid)
      if (error) {
        console.warn('[Supabase deleteCustomer Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase deleteCustomer Catch Error]', err)
    }
  }
  return removed
}

// 2. ORDERS
async function getOrders(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Supabase getOrders Error]', error.message, error.code)
      } else if (Array.isArray(data)) {
        return data.map(mapOrderFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getOrders Catch Error]', err)
    }
  }
  return db.orders.filter((o) => o.merchantId === merchantId)
}

async function getOrderById(merchantId, id) {
  if (isSupabaseActive()) {
    try {
      let query = supabase.from('orders').select('*').eq('id', id)
      if (merchantId) query = query.eq('merchant_id', toValidUuid(merchantId))
      const { data, error } = await query.single()

      if (error) {
        console.warn('[Supabase getOrderById Error]', error.message)
      } else if (data) {
        return mapOrderFromDb(data)
      }
    } catch (err) {
      console.warn('[Supabase getOrderById Catch Error]', err)
    }
  }
  return db.orders.find((o) => o.id === id && (o.merchantId === merchantId || !merchantId)) || null
}

async function saveOrder(order) {
  const existingIndex = db.orders.findIndex((o) => o.id === order.id)
  if (existingIndex >= 0) {
    db.orders[existingIndex] = order
  } else {
    db.orders.unshift(order)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(order.merchantId)
      if (order.customerId) {
        await ensureCustomerExists(order.customerId, order.merchantId, order.customerName, order.customerMobile, order.customerEmail)
      }
      const dbRow = mapOrderToDb(order)
      const { error } = await supabase.from('orders').upsert(dbRow)
      if (error) {
        console.warn('[Supabase saveOrder Upsert Error]', error.message, error.details, error.code)
      }
    } catch (err) {
      console.warn('[Supabase saveOrder Catch Error]', err)
    }
  }
  return order
}

async function deleteOrder(merchantId, id) {
  const index = db.orders.findIndex((o) => o.id === id && o.merchantId === merchantId)
  let removed = null
  if (index >= 0) {
    removed = db.orders.splice(index, 1)[0]
    saveDb()
  }

  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { error } = await supabase.from('orders').delete().eq('id', id).eq('merchant_id', validUuid)
      if (error) {
        console.warn('[Supabase deleteOrder Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase deleteOrder Catch Error]', err)
    }
  }
  return removed
}

// 3. PAYMENT LINKS
async function getPaymentLinks(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Supabase getPaymentLinks Error]', error.message)
      } else if (Array.isArray(data)) {
        return data.map(mapPaymentLinkFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getPaymentLinks Catch Error]', err)
    }
  }
  return db.paymentLinks.filter((l) => l.merchantId === merchantId)
}

async function savePaymentLink(link) {
  const existingIndex = db.paymentLinks.findIndex((l) => l.id === link.id)
  if (existingIndex >= 0) {
    db.paymentLinks[existingIndex] = link
  } else {
    db.paymentLinks.unshift(link)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(link.merchantId)
      const dbRow = mapPaymentLinkToDb(link)
      const { error } = await supabase.from('payments').upsert(dbRow)
      if (error) {
        console.warn('[Supabase savePaymentLink Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase savePaymentLink Catch Error]', err)
    }
  }
  return link
}

// 4. TRANSACTIONS
async function getTransactions(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('date', { ascending: false })

      if (error) {
        console.warn('[Supabase getTransactions Error]', error.message)
      } else if (Array.isArray(data)) {
        return data.map(mapTransactionFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getTransactions Catch Error]', err)
    }
  }
  return db.transactions.filter((t) => t.merchantId === merchantId)
}

async function saveTransaction(txn) {
  const existingIndex = db.transactions.findIndex((t) => t.id === txn.id)
  if (existingIndex >= 0) {
    db.transactions[existingIndex] = txn
  } else {
    db.transactions.unshift(txn)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(txn.merchantId)
      const dbRow = mapTransactionToDb(txn)
      const { error } = await supabase.from('transactions').upsert(dbRow)
      if (error) {
        console.warn('[Supabase saveTransaction Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase saveTransaction Catch Error]', err)
    }
  }
  return txn
}

// 5. BOOKINGS
async function getBookings(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('delivery_date', { ascending: true })

      if (error) {
        console.warn('[Supabase getBookings Error]', error.message)
      } else if (Array.isArray(data)) {
        return data.map(mapBookingFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getBookings Catch Error]', err)
    }
  }
  return db.bookings.filter((b) => b.merchantId === merchantId)
}

async function saveBooking(booking) {
  const existingIndex = db.bookings.findIndex((b) => b.id === booking.id || b.orderId === booking.orderId)
  if (existingIndex >= 0) {
    db.bookings[existingIndex] = booking
  } else {
    db.bookings.unshift(booking)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(booking.merchantId)
      const dbRow = mapBookingToDb(booking)
      const { error } = await supabase.from('bookings').upsert(dbRow)
      if (error) {
        console.warn('[Supabase saveBooking Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase saveBooking Catch Error]', err)
    }
  }
  return booking
}

// 6. INVOICES
async function getInvoices(merchantId) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('merchant_id', validUuid)
        .order('date', { ascending: false })

      if (error) {
        console.warn('[Supabase getInvoices Error]', error.message)
      } else if (Array.isArray(data)) {
        return data.map(mapInvoiceFromDb)
      }
    } catch (err) {
      console.warn('[Supabase getInvoices Catch Error]', err)
    }
  }
  return db.invoices.filter((i) => i.merchantId === merchantId)
}

async function getInvoiceById(merchantId, id) {
  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchantId)
      let query = supabase.from('invoices').select('*').or(`id.eq.${id},order_id.eq.${id}`)
      if (validUuid) query = query.eq('merchant_id', validUuid)
      const { data, error } = await query.single()

      if (error) {
        console.warn('[Supabase getInvoiceById Error]', error.message)
      } else if (data) {
        return mapInvoiceFromDb(data)
      }
    } catch (err) {
      console.warn('[Supabase getInvoiceById Catch Error]', err)
    }
  }
  return db.invoices.find((i) => (i.id === id || i.orderId === id) && i.merchantId === merchantId) || null
}

async function saveInvoice(invoice) {
  const existingIndex = db.invoices.findIndex((i) => i.id === invoice.id || i.orderId === invoice.orderId)
  if (existingIndex >= 0) {
    db.invoices[existingIndex] = invoice
  } else {
    db.invoices.unshift(invoice)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      await ensureMerchantExists(invoice.merchantId)
      const dbRow = mapInvoiceToDb(invoice)
      const { error } = await supabase.from('invoices').upsert(dbRow)
      if (error) {
        console.warn('[Supabase saveInvoice Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase saveInvoice Catch Error]', err)
    }
  }
  return invoice
}

// 7. MERCHANTS
async function getMerchantByEmail(email) {
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .ilike('email', email.trim().toLowerCase())
        .single()

      if (error) {
        console.warn('[Supabase getMerchantByEmail Error]', error.message)
      } else if (data) {
        return mapMerchantFromDb(data)
      }
    } catch (err) {
      console.warn('[Supabase getMerchantByEmail Catch Error]', err)
    }
  }
  return db.merchants.find((m) => m.email.toLowerCase() === email.trim().toLowerCase()) || null
}

async function saveMerchant(merchant) {
  const existingIndex = db.merchants.findIndex((m) => m.id === merchant.id || m.email === merchant.email)
  if (existingIndex >= 0) {
    db.merchants[existingIndex] = { ...db.merchants[existingIndex], ...merchant }
  } else {
    db.merchants.push(merchant)
  }
  saveDb()

  if (isSupabaseActive()) {
    try {
      const validUuid = toValidUuid(merchant.id)
      const { error } = await supabase.from('merchants').upsert({
        id: validUuid,
        user_id: merchant.user_id ? toValidUuid(merchant.user_id) : null,
        business_name: merchant.businessName || 'My Business',
        owner_name: merchant.ownerName || 'Merchant Owner',
        mobile: merchant.mobile || '',
        email: merchant.email ? merchant.email.toLowerCase() : '',
        category: merchant.category || 'Home Baker & Confectionery',
        platform_fee_percent: merchant.platformFeePercent || 1.0,
        dark_mode: Boolean(merchant.darkMode),
      })
      if (error) {
        console.warn('[Supabase saveMerchant Error]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase saveMerchant Catch Error]', err)
    }
  }
  return merchant
}

module.exports = {
  toValidUuid,
  ensureMerchantExists,
  ensureCustomerExists,
  getCustomers,
  getCustomerById,
  saveCustomer,
  deleteCustomer,
  getOrders,
  getOrderById,
  saveOrder,
  deleteOrder,
  getPaymentLinks,
  savePaymentLink,
  getTransactions,
  saveTransaction,
  getBookings,
  saveBooking,
  getInvoices,
  getInvoiceById,
  saveInvoice,
  getMerchantByEmail,
  saveMerchant,
  mapCustomerFromDb,
  mapOrderFromDb,
  mapPaymentLinkFromDb,
  mapTransactionFromDb,
  mapBookingFromDb,
  mapInvoiceFromDb,
  mapMerchantFromDb,
}
