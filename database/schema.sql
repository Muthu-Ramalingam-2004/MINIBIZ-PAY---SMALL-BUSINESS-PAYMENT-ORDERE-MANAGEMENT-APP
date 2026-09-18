-- MiniBiz Pay Supabase PostgreSQL Database Schema DDL
-- Small Business Payment & Order Management App

-- 1. MERCHANTS TABLE
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Foreign key referencing auth.users in Supabase Auth
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'Home Baker & Confectionery',
  platform_fee_percent NUMERIC(5, 2) DEFAULT 1.00,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  pending_amount NUMERIC(12, 2) DEFAULT 0.00,
  last_order_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY, -- e.g. ORD-1001
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  product_service TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid', -- Unpaid, Advance Paid, Fully Paid
  order_status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Preparing, Ready, Delivered, Completed, Cancelled
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) DEFAULT '10:30 AM',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PAYMENTS (Mock Payment Links) TABLE
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY, -- e.g. LNK-501
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(50),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  link_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Paid, Expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY, -- e.g. TXN-88201
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- Advance, Balance, Full
  payment_method VARCHAR(100) DEFAULT 'UPI (Mock Razorpay/Cashfree)',
  status VARCHAR(50) NOT NULL DEFAULT 'Successful', -- Successful, Pending, Failed
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY, -- e.g. BKG-1001
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(50),
  product_service TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) DEFAULT '10:30 AM',
  amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(50) PRIMARY KEY, -- e.g. INV-2026-001
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT,
  customer_mobile VARCHAR(50),
  customer_email VARCHAR(255),
  product_service TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(delivery_date);
