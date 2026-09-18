import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/utils'
import { PaymentStatus } from '@/types'

interface PaymentSummaryProps {
  totalAmount: number
  advanceAmount: number
  balanceAmount: number
  paymentStatus: PaymentStatus
  className?: string
}

export function PaymentSummary({ totalAmount, advanceAmount, balanceAmount, paymentStatus, className }: PaymentSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
        <StatusBadge status={paymentStatus} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Total Amount</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Advance Paid</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(advanceAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-slate-800 dark:text-slate-200 font-bold">Balance Due</span>
          <span className="font-bold text-rose-600 dark:text-rose-400 text-base">{formatCurrency(balanceAmount)}</span>
        </div>

        {balanceAmount > 0 && (
          <div className="mt-4 p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Note:</span> Balance of {formatCurrency(balanceAmount)} due before/upon delivery.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
