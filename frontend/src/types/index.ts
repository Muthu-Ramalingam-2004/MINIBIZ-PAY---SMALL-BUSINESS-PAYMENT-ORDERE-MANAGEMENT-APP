export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'

export type PaymentStatus = 'Unpaid' | 'Advance Paid' | 'Fully Paid'

export interface Customer {
  id: string
  name: string
  mobile: string
  email: string
  address: string
  notes?: string
  totalOrders: number
  totalSpent: number
  pendingAmount: number
  lastOrderDate: string
  createdAt: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerMobile: string
  customerEmail: string
  productService: string
  totalAmount: number
  advanceAmount: number
  balanceAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  deliveryDate: string
  deliveryTime: string
  notes?: string
  createdAt: string
}

export interface PaymentLink {
  id: string
  orderId?: string
  customerName: string
  customerMobile?: string
  amount: number
  description: string
  linkUrl: string
  status: 'Active' | 'Paid' | 'Expired'
  createdAt: string
}

export interface Transaction {
  id: string
  orderId: string
  customerName: string
  amount: number
  paymentType: 'Advance' | 'Balance' | 'Full'
  status: 'Successful' | 'Pending' | 'Failed'
  paymentMethod: string
  date: string
}

export interface Invoice {
  id: string
  orderId: string
  customerName: string
  customerAddress: string
  customerMobile: string
  customerEmail: string
  productService: string
  totalAmount: number
  advanceAmount: number
  balanceAmount: number
  paymentStatus: PaymentStatus
  date: string
  dueDate: string
}

export interface MerchantProfile {
  id?: string
  businessName: string
  ownerName: string
  mobile: string
  email: string
  category: string
  platformFeePercent: number
  darkMode: boolean
}
