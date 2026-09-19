'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, ShieldCheck, ArrowLeft, Store, Lock, Sparkles, Loader2 } from 'lucide-react'

export default function MockCustomerPaymentPage() {
  const params = useParams()
  const orderId = (params?.id as string) || 'ORD-1001'
  const { orders, merchant, processMockPayment } = useApp()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txnId, setTxnId] = useState('')

  const order = orders.find((o) => o.id === orderId) || {
    id: 'ORD-1001',
    customerName: 'Rahul Kumar',
    productService: 'Custom Birthday Cake (2kg Chocolate Truffle)',
    totalAmount: 1500,
    advanceAmount: 500,
    balanceAmount: 1000,
    paymentStatus: 'Advance Paid',
  }

  const payableAmount = order.balanceAmount > 0 ? order.balanceAmount : order.advanceAmount || 500
  const paymentTypeLabel = order.advanceAmount === 0 ? 'Advance' : order.balanceAmount > 0 ? 'Balance' : 'Full'

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const generatedTxn = `TXN-${Math.floor(10000 + Math.random() * 90000)}`
      setTxnId(generatedTxn)
      processMockPayment(order.id, payableAmount, paymentTypeLabel as 'Advance' | 'Balance' | 'Full')
      setIsProcessing(false)
      setIsSuccess(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      {/* MiniBiz Pay Logo Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-md">
          M
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xl tracking-tight leading-none">
            MiniBiz<span className="text-brand-600 dark:text-brand-400">Pay</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Secure Checkout</span>
        </div>
      </div>

      <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Top Disclaimer Header */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>MOCK PAYMENT DEMO • No real bank transaction</span>
        </div>

        {!isSuccess ? (
          <CardContent className="p-6 space-y-6">
            {/* Merchant Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0 border border-brand-200 dark:border-brand-800">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase">Merchant</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{merchant?.businessName || 'MiniBiz Merchant'}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{merchant?.category || 'Retail & Services'}</p>
              </div>
            </div>

            {/* Payment Details Box */}
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Order Number:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{order.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Customer:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Item Description:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[180px] truncate">{order.productService}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Payment Type:</span>
                <span className="px-2 py-0.5 font-semibold text-[10px] bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800">
                  {paymentTypeLabel} Payment
                </span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="text-center p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-inner border border-slate-800 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Amount Due</span>
              <span className="text-3xl font-black tracking-tight text-white mt-1 block">{formatCurrency(payableAmount)}</span>
            </div>

            {/* Payment Action */}
            <Button
              variant="success"
              size="lg"
              className="w-full text-base font-bold py-3.5 shadow-lg"
              isLoading={isProcessing}
              onClick={handlePay}
            >
              Pay {formatCurrency(payableAmount)}
            </Button>

            <div className="text-center space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> 256-bit Mock Encrypted Simulation
              </p>
              <p className="text-[10px] text-slate-400 italic">No PIN, CVV, or card details required.</p>
            </div>
          </CardContent>
        ) : (
          /* Payment Success Receipt Screen */
          <CardContent className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Payment Successful!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thank you! Your payment has been received by {merchant?.businessName || 'MiniBiz Merchant'}.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{txnId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Order Reference:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{order.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(payableAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <Link href={`/orders/${order.id}`}>
              <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Order Details
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
