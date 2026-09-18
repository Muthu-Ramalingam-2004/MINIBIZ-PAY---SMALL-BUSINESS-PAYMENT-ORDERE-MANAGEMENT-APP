# MiniBiz Pay - Small Business Payment & Order Management App

MiniBiz Pay is a professional SaaS web application designed for small business owners (home bakers, Instagram/WhatsApp sellers, freelancers, tutors, boutiques) to handle customer orders, advance deposits, booking calendars, automated invoices, and financial reports.

---

## 🏗 Project Architecture

```
MiniBiz-Pay/
├── frontend/        # Next.js 14 App Router, React, Tailwind CSS, Lucide Icons, Recharts
├── backend/         # Node.js + Express.js REST API with Supabase integration
├── database/        # Supabase PostgreSQL DDL (schema.sql)
└── README.md        # Documentation & Setup Guide
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Prerequisites
- Node.js v18+ and npm installed.
- (Optional) Supabase project credentials for production cloud PostgreSQL.

### 2. Backend Setup (`backend/`)
```bash
cd backend
npm install
cp .env.example .env
npm run dev # Starts server on http://localhost:5000
```

### 3. Frontend Setup (`frontend/`)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev # Starts Next.js app on http://localhost:3000
```

---

## 🔑 Key Features & Workflow
- **Customer → Order → Advance Deposit → Booking → Balance Payment → Completion**
- Formula calculation: `Balance Amount = Total Amount - Advance Amount`.
- Mock payment simulation with instant order status progression (`Pending` → `Confirmed`).
- Automatic calendar booking creation upon order confirmation.
- One-click WhatsApp pre-filled reminder & invoice sharing.
- Configurable platform fee calculator & admin SaaS dashboard.
