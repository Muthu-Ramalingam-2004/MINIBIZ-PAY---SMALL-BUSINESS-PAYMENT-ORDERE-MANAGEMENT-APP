const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const { supabase } = require('./supabase')

const DB_FILE_PATH = path.join(__dirname, '../../../database/minibiz_db.json')

// Initial seed data for demo merchant MCH-001 (Priya Sharma)
const INITIAL_DB = {
  merchants: [
    {
      id: 'MCH-001',
      user_id: 'usr_priya_001',
      businessName: 'Sweet Treats Bakery & Crafts',
      ownerName: 'Priya Sharma',
      mobile: '+91 98200 12345',
      email: 'priya@sweettreats.com',
      category: 'Home Baker & Confectionery',
      platformFeePercent: 1.0,
      darkMode: false,
      passwordHash: bcrypt.hashSync('password123', 8),
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  customers: [
    {
      id: 'CUST-001',
      merchantId: 'MCH-001',
      name: 'Rahul Kumar',
      mobile: '+91 98765 43210',
      email: 'rahul.k@example.com',
      address: '102 Park Avenue, Bandra West, Mumbai, 400050',
      notes: 'Prefers less sugar. Regular customer for family birthdays.',
      totalOrders: 4,
      totalSpent: 6200,
      pendingAmount: 1000,
      lastOrderDate: '2026-09-19',
      createdAt: '2026-01-15',
    },
    {
      id: 'CUST-002',
      merchantId: 'MCH-001',
      name: 'Ananya Roy',
      mobile: '+91 98199 87654',
      email: 'ananya.roy@example.com',
      address: 'B-404 Sunshine Towers, Indiranagar, Bengaluru, 560038',
      notes: 'Eggless pastries & vegan cupcakes preference.',
      totalOrders: 2,
      totalSpent: 3500,
      pendingAmount: 0,
      lastOrderDate: '2026-09-18',
      createdAt: '2026-03-10',
    },
    {
      id: 'CUST-003',
      merchantId: 'MCH-001',
      name: 'Vikram Mehta',
      mobile: '+91 97654 32109',
      email: 'vikram.m@corporatedesign.in',
      address: '801 Commercial Plaza, MG Road, Pune, 411001',
      notes: 'Corporate hamper orders. Requires detailed GST invoice.',
      totalOrders: 6,
      totalSpent: 24500,
      pendingAmount: 4500,
      lastOrderDate: '2026-09-20',
      createdAt: '2025-11-20',
    },
  ],
  orders: [
    {
      id: 'ORD-1001',
      merchantId: 'MCH-001',
      customerId: 'CUST-001',
      customerName: 'Rahul Kumar',
      customerMobile: '+91 98765 43210',
      customerEmail: 'rahul.k@example.com',
      productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
      totalAmount: 1500,
      advanceAmount: 500,
      balanceAmount: 1000,
      paymentStatus: 'Advance Paid',
      orderStatus: 'Confirmed',
      deliveryDate: '2026-09-19',
      deliveryTime: '10:30 AM',
      notes: 'Blue buttercream frosting with "Happy 10th Birthday Arav" written.',
      createdAt: '2026-09-17T14:30:00Z',
    },
    {
      id: 'ORD-1002',
      merchantId: 'MCH-001',
      customerId: 'CUST-002',
      customerName: 'Ananya Roy',
      customerMobile: '+91 98199 87654',
      customerEmail: 'ananya.roy@example.com',
      productService: 'Assorted Macarons Box (12 Pcs)',
      totalAmount: 1200,
      advanceAmount: 1200,
      balanceAmount: 0,
      paymentStatus: 'Fully Paid',
      orderStatus: 'Delivered',
      deliveryDate: '2026-09-18',
      deliveryTime: '04:00 PM',
      notes: 'Ribbon box packaging.',
      createdAt: '2026-09-16T11:00:00Z',
    },
    {
      id: 'ORD-1003',
      merchantId: 'MCH-001',
      customerId: 'CUST-003',
      customerName: 'Vikram Mehta',
      customerMobile: '+91 97654 32109',
      customerEmail: 'vikram.m@corporatedesign.in',
      productService: 'Corporate Snack & Cookie Gift Baskets (x10)',
      totalAmount: 12500,
      advanceAmount: 8000,
      balanceAmount: 4500,
      paymentStatus: 'Advance Paid',
      orderStatus: 'Preparing',
      deliveryDate: '2026-09-20',
      deliveryTime: '11:00 AM',
      notes: 'Company logo tags to be attached on each basket.',
      createdAt: '2026-09-15T09:15:00Z',
    },
  ],
  paymentLinks: [
    {
      id: 'LNK-501',
      merchantId: 'MCH-001',
      orderId: 'ORD-1001',
      customerName: 'Rahul Kumar',
      customerMobile: '+91 98765 43210',
      amount: 500,
      description: 'Advance Payment for Order #ORD-1001',
      linkUrl: 'http://localhost:3000/payment/ORD-1001',
      status: 'Paid',
      createdAt: '2026-09-17 14:30 PM',
    },
    {
      id: 'LNK-502',
      merchantId: 'MCH-001',
      orderId: 'ORD-1001',
      customerName: 'Rahul Kumar',
      customerMobile: '+91 98765 43210',
      amount: 1000,
      description: 'Balance Payment Due for Order #ORD-1001',
      linkUrl: 'http://localhost:3000/payment/ORD-1001',
      status: 'Active',
      createdAt: '2026-09-18 10:00 AM',
    },
  ],
  transactions: [
    {
      id: 'TXN-88201',
      merchantId: 'MCH-001',
      orderId: 'ORD-1001',
      customerName: 'Rahul Kumar',
      amount: 500,
      paymentType: 'Advance',
      status: 'Successful',
      paymentMethod: 'UPI (GPay)',
      date: '2026-09-17 14:35 PM',
    },
  ],
  bookings: [
    {
      id: 'BKG-ORD-1001',
      merchantId: 'MCH-001',
      orderId: 'ORD-1001',
      customerName: 'Rahul Kumar',
      customerMobile: '+91 98765 43210',
      productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
      date: '2026-09-19',
      time: '10:30 AM',
      amount: 1500,
      status: 'Confirmed',
      createdAt: '2026-09-17T14:30:00Z',
    },
  ],
  invoices: [
    {
      id: 'INV-2026-001',
      merchantId: 'MCH-001',
      orderId: 'ORD-1001',
      customerName: 'Rahul Kumar',
      customerAddress: 'rahul.k@example.com',
      customerMobile: '+91 98765 43210',
      customerEmail: 'rahul.k@example.com',
      productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
      totalAmount: 1500,
      advanceAmount: 500,
      balanceAmount: 1000,
      paymentStatus: 'Advance Paid',
      date: '2026-09-17',
      dueDate: '2026-09-19',
      createdAt: '2026-09-17T14:30:00Z',
    },
  ],
}

let memoryDb = null

function loadDb() {
  if (memoryDb) return memoryDb
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8')
      memoryDb = JSON.parse(content)
    } else {
      memoryDb = JSON.parse(JSON.stringify(INITIAL_DB))
      saveDb()
    }
  } catch (err) {
    console.error('Error reading persistent database file:', err)
    memoryDb = JSON.parse(JSON.stringify(INITIAL_DB))
  }
  return memoryDb
}

function saveDb() {
  try {
    const dir = path.dirname(DB_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryDb, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving persistent database file:', err)
  }
}

const db = {
  get merchants() {
    return loadDb().merchants
  },
  get customers() {
    return loadDb().customers
  },
  get orders() {
    return loadDb().orders
  },
  get paymentLinks() {
    return loadDb().paymentLinks
  },
  get transactions() {
    return loadDb().transactions
  },
  get bookings() {
    return loadDb().bookings
  },
  get invoices() {
    return loadDb().invoices
  },
  save: saveDb,
}

module.exports = { db, saveDb }
