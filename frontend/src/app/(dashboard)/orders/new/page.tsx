'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, UserPlus, Calendar, Clock, Calculator } from 'lucide-react'
import { OrderStatus, PaymentStatus } from '@/types'

export default function CreateOrderPage() {
  const router = useRouter()
  const { customers, addOrder, addToast } = useApp()

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '')
  const [productService, setProductService] = useState('')
  const [totalAmount, setTotalAmount] = useState<number | ''>(1500)
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(500)
  const [deliveryDate, setDeliveryDate] = useState('2026-09-20')
  const [deliveryTime, setDeliveryTime] = useState('10:30 AM')
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Confirmed')
  const [notes, setNotes] = useState('')

  // New Customer inline fields
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newCustMobile, setNewCustMobile] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Automatic Formula Calculation: Balance = Total - Advance (non-negative)
  const numTotal = typeof totalAmount === 'number' ? totalAmount : 0
  const numAdvance = typeof advanceAmount === 'number' ? advanceAmount : 0
  const calculatedBalance = Math.max(0, numTotal - numAdvance)

  // Derived Payment Status
  let derivedPaymentStatus: PaymentStatus = 'Unpaid'
  if (numTotal > 0 && numAdvance >= numTotal) {
    derivedPaymentStatus = 'Fully Paid'
  } else if (numAdvance > 0) {
    derivedPaymentStatus = 'Advance Paid'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (isNewCustomer) {
      if (!newCustName.trim()) newErrors.newCustName = 'Customer name is required'
      if (!newCustMobile.trim()) newErrors.newCustMobile = 'Mobile number is required'
    } else {
      if (!selectedCustomerId) newErrors.customerId = 'Please select a customer'
    }

    if (!productService.trim()) newErrors.productService = 'Product or service description required'
    if (numTotal <= 0) newErrors.totalAmount = 'Total amount must be greater than 0'
    if (numAdvance > numTotal) newErrors.advanceAmount = 'Advance cannot exceed total amount'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedCustObj = customers.find((c) => c.id === selectedCustomerId)

    const finalCustId = isNewCustomer ? `CUST-${Date.now()}` : selectedCustObj?.id || 'CUST-001'
    const finalCustName = isNewCustomer ? newCustName : selectedCustObj?.name || 'Customer'
    const finalCustMobile = isNewCustomer ? newCustMobile : selectedCustObj?.mobile || '+91 98765 43210'
    const finalCustEmail = isNewCustomer ? newCustEmail : selectedCustObj?.email || ''

    const createdOrder = addOrder({
      customerId: finalCustId,
      customerName: finalCustName,
      customerMobile: finalCustMobile,
      customerEmail: finalCustEmail,
      productService,
      totalAmount: numTotal,
      advanceAmount: numAdvance,
      orderStatus,
      deliveryDate,
      deliveryTime,
      notes,
    })

    router.push(`/orders/${createdOrder.id}`)
  }

  return (
    <div className="space-y-6">
      <Link href="/orders">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Orders
        </Button>
      </Link>

      <PageHeader title="Create New Order" subtitle="Record customer booking, total billing, and advance deposit" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Selection</CardTitle>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isNewCustomer ? 'Select Existing Customer' : '+ Add New Customer'}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isNewCustomer ? (
                <Select
                  label="Select Customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  options={customers.map((c) => ({
                    label: `${c.name} (${c.mobile})`,
                    value: c.id,
                  }))}
                  error={errors.customerId}
                  required
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer Name"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    error={errors.newCustName}
                    required
                  />
                  <Input
                    label="Mobile Number"
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    error={errors.newCustMobile}
                    required
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Email Address (Optional)"
                      type="email"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product & Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order & Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product / Service Description"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                placeholder="e.g. Custom Birthday Cake (2kg Chocolate Truffle)"
                error={errors.productService}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Total Amount (₹)"
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.totalAmount}
                  required
                />

                <Input
                  label="Advance Collected (₹)"
                  type="number"
                  min="0"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.advanceAmount}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Balance Due (₹)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formatCurrency(calculatedBalance)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-100 py-2 px-3 text-sm font-bold text-rose-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-brand-600" /> Auto-calculated: Total - Advance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Input
                  label="Delivery / Service Date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Time Slot"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
                />

                <Select
                  label="Initial Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  options={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Confirmed', value: 'Confirmed' },
                    { label: 'Preparing', value: 'Preparing' },
                    { label: 'Ready', value: 'Ready' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Special Notes / Custom Requirements
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Blue buttercream frosting with text Happy Birthday Arav..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Link href="/orders">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save & Create Order
            </Button>
          </div>
        </div>

        {/* Right Sticky Order Summary Card (Desktop) */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-brand-200">
            <CardHeader className="bg-brand-50/50">
              <CardTitle className="text-brand-900">Live Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">
                    {isNewCustomer
                      ? newCustName || 'New Customer'
                      : customers.find((c) => c.id === selectedCustomerId)?.name || 'Select Customer'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Product:</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[160px]">
                    {productService || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(numTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(numAdvance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Balance Due:</span>
                  <span className="font-bold text-rose-600 text-sm">{formatCurrency(calculatedBalance)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Payment Status:</span>
                  <StatusBadge status={derivedPaymentStatus} />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Order Status:</span>
                  <StatusBadge status={orderStatus} />
                </div>
                <div className="flex justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-500">Delivery Date:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(deliveryDate)} at {deliveryTime}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                ✨ Generating this order will automatically generate a printable invoice and update your financial dashboard.
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
