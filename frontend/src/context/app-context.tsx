'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Customer, Order, PaymentLink, Transaction, Invoice, MerchantProfile, OrderStatus, PaymentStatus } from '@/types'
import { apiRequest } from '@/lib/api-client'

export interface ToastMessage {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}

interface AppContextType {
  merchant: MerchantProfile | null
  isAuthenticated: boolean
  authLoading: boolean
  customers: Customer[]
  orders: Order[]
  transactions: Transaction[]
  paymentLinks: PaymentLink[]
  invoices: Invoice[]
  toasts: ToastMessage[]
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void
  removeToast: (id: string) => void
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'pendingAmount' | 'lastOrderDate' | 'createdAt'>) => Customer
  updateCustomer: (id: string, customerData: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addOrder: (order: Omit<Order, 'id' | 'paymentStatus' | 'balanceAmount' | 'createdAt'>) => Order
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus, paidAmount?: number) => void
  generatePaymentLink: (customerName: string, amount: number, description: string, orderId?: string, customerMobile?: string) => PaymentLink
  processMockPayment: (orderId: string, amount: number, paymentType: 'Advance' | 'Balance' | 'Full') => void
  updateMerchant: (data: Partial<MerchantProfile>) => void
  refreshData: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: { businessName: string; ownerName: string; mobile?: string; email: string; category?: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string; recoveryToken?: string }>
  resetPassword: (data: { email: string; newPassword: string; recoveryToken?: string }) => Promise<{ success: boolean; error?: string; message?: string }>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authLoading, setAuthLoading] = useState<boolean>(true)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const isDark = savedTheme ? savedTheme === 'dark' : document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  // Optimized theme toggling without network call overhead
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextTheme)
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const fetchEntities = async () => {
    try {
      const [cRes, oRes, lRes, tRes, iRes] = await Promise.all([
        apiRequest<Customer[]>('/customers', { timeoutMs: 12000 }),
        apiRequest<Order[]>('/orders', { timeoutMs: 12000 }),
        apiRequest<PaymentLink[]>('/payments/links', { timeoutMs: 12000 }),
        apiRequest<Transaction[]>('/payments/transactions', { timeoutMs: 12000 }),
        apiRequest<Invoice[]>('/invoices', { timeoutMs: 12000 }),
      ])

      if (cRes.success && cRes.data) setCustomers(cRes.data)
      if (oRes.success && oRes.data) setOrders(oRes.data)
      if (lRes.success && lRes.data) setPaymentLinks(lRes.data)
      if (tRes.success && tRes.data) setTransactions(tRes.data)
      if (iRes.success && iRes.data) setInvoices(iRes.data)
    } catch (err) {
      console.warn('[Fetch Entities Error]', err)
    }
  }

  const checkAuthSession = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setMerchant(null)
      setIsAuthenticated(false)
      setAuthLoading(false)
      setCustomers([])
      setOrders([])
      setPaymentLinks([])
      setTransactions([])
      setInvoices([])
      return
    }

    try {
      // 6-second max timeout for session validation so initial page load never hangs
      const mRes = await apiRequest<MerchantProfile>('/auth/me', { timeoutMs: 6000 })
      if (mRes.success && mRes.data) {
        setMerchant(mRes.data)
        setIsAuthenticated(true)
        if (mRes.data.darkMode) {
          setTheme('dark')
          if (typeof window !== 'undefined') document.documentElement.classList.add('dark')
        }
        setAuthLoading(false) // IMMEDIATELY unblock UI navigation
        fetchEntities() // Fetch dashboard data asynchronously in background
      } else {
        if (typeof window !== 'undefined') localStorage.removeItem('token')
        setMerchant(null)
        setIsAuthenticated(false)
        setCustomers([])
        setOrders([])
        setPaymentLinks([])
        setTransactions([])
        setInvoices([])
        setAuthLoading(false)
      }
    } catch {
      if (typeof window !== 'undefined') localStorage.removeItem('token')
      setMerchant(null)
      setIsAuthenticated(false)
      setCustomers([])
      setOrders([])
      setPaymentLinks([])
      setTransactions([])
      setInvoices([])
      setAuthLoading(false)
    }
  }

  const refreshData = async () => {
    await checkAuthSession()
  }

  useEffect(() => {
    checkAuthSession()
  }, [])

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 25-second timeout to allow Render free-tier cold start if backend is waking up
    const res = await apiRequest<{ token: string; merchant: MerchantProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      timeoutMs: 25000,
    })

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token)
      }
      setMerchant(res.data.merchant)
      setIsAuthenticated(true)
      if (res.data.merchant.darkMode) {
        setTheme('dark')
        if (typeof window !== 'undefined') document.documentElement.classList.add('dark')
      }
      addToast('Welcome Back!', `Logged in as ${res.data.merchant.ownerName}`, 'success')
      fetchEntities()
      return { success: true }
    } else {
      return { success: false, error: res.error || 'Invalid email or password' }
    }
  }

  const signup = async (data: { businessName: string; ownerName: string; mobile?: string; email: string; category?: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    const res = await apiRequest<{ token: string; merchant: MerchantProfile }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: 25000,
    })

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token)
      }
      setMerchant(res.data.merchant)
      setIsAuthenticated(true)
      addToast('Account Created!', `Welcome to MiniBiz Pay, ${res.data.merchant.ownerName}!`, 'success')
      fetchEntities()
      return { success: true }
    } else {
      return { success: false, error: res.error || 'Signup failed' }
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setMerchant(null)
    setIsAuthenticated(false)
    setCustomers([])
    setOrders([])
    setTransactions([])
    setPaymentLinks([])
    setInvoices([])
    addToast('Logged Out', 'You have been logged out.', 'info')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string; message?: string; recoveryToken?: string }> => {
    const res = await apiRequest<{ message: string; recoveryToken?: string }>('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    if (res.success) {
      return { success: true, message: res.message, recoveryToken: res.data?.recoveryToken }
    }
    return { success: false, error: res.error || 'Failed to verify account email' }
  }

  const resetPassword = async (data: { email: string; newPassword: string; recoveryToken?: string }): Promise<{ success: boolean; error?: string; message?: string }> => {
    const res = await apiRequest<{ message: string }>('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (res.success) {
      return { success: true, message: res.message || 'Password changed successfully. Please login with your new password.' }
    }
    return { success: false, error: res.error || 'Failed to update password' }
  }

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'pendingAmount' | 'lastOrderDate' | 'createdAt'>): Customer => {
    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      totalOrders: 0,
      totalSpent: 0,
      pendingAmount: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    }

    setCustomers((prev) => [newCustomer, ...prev])

    apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })

    addToast('Customer Created', `${newCustomer.name} has been added to customer directory.`, 'success')
    return newCustomer
  }

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customerData } : c)))
    apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    })
    addToast('Customer Updated', 'Customer details updated successfully.', 'success')
  }

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id)
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    apiRequest(`/customers/${id}`, { method: 'DELETE' })
    addToast('Customer Deleted', `${target?.name || 'Customer'} removed from record.`, 'info')
  }

  const addOrder = (orderInput: Omit<Order, 'id' | 'paymentStatus' | 'balanceAmount' | 'createdAt'>): Order => {
    const nextNum = 1001 + orders.length
    const orderId = `ORD-${nextNum}`
    const balance = Math.max(0, orderInput.totalAmount - orderInput.advanceAmount)

    let payStatus: PaymentStatus = 'Unpaid'
    if (orderInput.advanceAmount >= orderInput.totalAmount && orderInput.totalAmount > 0) {
      payStatus = 'Fully Paid'
    } else if (orderInput.advanceAmount > 0) {
      payStatus = 'Advance Paid'
    }

    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      balanceAmount: balance,
      paymentStatus: payStatus,
      createdAt: new Date().toISOString(),
    }

    setOrders((prev) => [newOrder, ...prev])

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === orderInput.customerId || c.name.toLowerCase() === orderInput.customerName.toLowerCase()) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpent: c.totalSpent + orderInput.advanceAmount,
            pendingAmount: c.pendingAmount + balance,
            lastOrderDate: orderInput.deliveryDate,
          }
        }
        return c
      })
    )

    const newInvoice: Invoice = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      customerAddress: newOrder.customerEmail,
      customerMobile: newOrder.customerMobile,
      customerEmail: newOrder.customerEmail,
      productService: newOrder.productService,
      totalAmount: newOrder.totalAmount,
      advanceAmount: newOrder.advanceAmount,
      balanceAmount: newOrder.balanceAmount,
      paymentStatus: newOrder.paymentStatus,
      date: new Date().toISOString().split('T')[0],
      dueDate: newOrder.deliveryDate,
    }
    setInvoices((prev) => [newInvoice, ...prev])

    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderInput),
    })

    addToast('Order Created', `Order ${orderId} for ${newOrder.customerName} created successfully!`, 'success')
    return newOrder
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o)))
    apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    addToast('Status Updated', `Order ${orderId} status changed to ${status}.`, 'info')
  }

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus, paidAmount?: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newAdvance = paidAmount ? Math.min(o.totalAmount, o.advanceAmount + paidAmount) : o.advanceAmount
          const newBalance = Math.max(0, o.totalAmount - newAdvance)
          return {
            ...o,
            paymentStatus,
            advanceAmount: newAdvance,
            balanceAmount: newBalance,
          }
        }
        return o
      })
    )
  }

  const generatePaymentLink = (customerName: string, amount: number, description: string, orderId?: string, customerMobile?: string): PaymentLink => {
    const linkId = `LNK-${501 + paymentLinks.length}`
    const targetOrder = orderId || 'ORD-1001'
    const newLink: PaymentLink = {
      id: linkId,
      orderId: targetOrder,
      customerName,
      customerMobile,
      amount,
      description,
      linkUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/payment/${targetOrder}`,
      status: 'Active',
      createdAt: new Date().toLocaleString(),
    }

    setPaymentLinks((prev) => [newLink, ...prev])

    apiRequest('/payments/generate-link', {
      method: 'POST',
      body: JSON.stringify({ customerName, amount, description, orderId: targetOrder, customerMobile }),
    })

    addToast('Payment Link Generated', `Link of ₹${amount} created for ${customerName}.`, 'success')
    return newLink
  }

  const processMockPayment = (orderId: string, amount: number, paymentType: 'Advance' | 'Balance' | 'Full') => {
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId,
      customerName: orders.find((o) => o.id === orderId)?.customerName || 'Customer',
      amount,
      paymentType,
      status: 'Successful',
      paymentMethod: 'UPI (Mock Payment)',
      date: new Date().toLocaleString(),
    }
    setTransactions((prev) => [newTxn, ...prev])

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newAdvance = paymentType === 'Full' ? o.totalAmount : o.advanceAmount + amount
          const newBalance = Math.max(0, o.totalAmount - newAdvance)
          const newPayStatus: PaymentStatus = newBalance === 0 ? 'Fully Paid' : 'Advance Paid'
          const newOrderStatus: OrderStatus = o.orderStatus === 'Pending' ? 'Confirmed' : o.orderStatus
          return {
            ...o,
            advanceAmount: Math.min(o.totalAmount, newAdvance),
            balanceAmount: newBalance,
            paymentStatus: newPayStatus,
            orderStatus: newOrderStatus,
          }
        }
        return o
      })
    )

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.orderId === orderId) {
          const newAdv = paymentType === 'Full' ? inv.totalAmount : inv.advanceAmount + amount
          const newBal = Math.max(0, inv.totalAmount - newAdv)
          return {
            ...inv,
            advanceAmount: Math.min(inv.totalAmount, newAdv),
            balanceAmount: newBal,
            paymentStatus: newBal === 0 ? 'Fully Paid' : 'Advance Paid',
          }
        }
        return inv
      })
    )

    setPaymentLinks((prev) =>
      prev.map((l) => (l.orderId === orderId ? { ...l, status: 'Paid' } : l))
    )

    apiRequest('/payments/mock-pay', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, paymentType }),
    })

    addToast('Mock Payment Successful', `Received ₹${amount} for Order ${orderId}.`, 'success')
  }

  const updateMerchant = (data: Partial<MerchantProfile>) => {
    if (!merchant) return
    setMerchant((prev) => (prev ? { ...prev, ...data } : null))
    apiRequest('/auth/merchant', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    addToast('Settings Saved', 'Business settings updated successfully.', 'success')
  }

  const merchantOrDefault: MerchantProfile = merchant || {
    id: '',
    businessName: '',
    ownerName: '',
    mobile: '',
    email: '',
    category: 'Home Baker & Confectionery',
    platformFeePercent: 1.0,
    darkMode: false as boolean,
  }

  return (
    <AppContext.Provider
      value={{
        merchant: merchantOrDefault,
        isAuthenticated,
        authLoading,
        customers,
        orders,
        transactions,
        paymentLinks,
        invoices,
        toasts,
        sidebarOpen,
        theme,
        toggleTheme,
        setSidebarOpen,
        addToast,
        removeToast,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrderStatus,
        updatePaymentStatus,
        generatePaymentLink,
        processMockPayment,
        updateMerchant,
        refreshData,
        login,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
