'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Printer, Share2, Download, Store, QrCode } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params?.id as string
  const { invoices, merchant } = useApp()

  const invoice = invoices.find((inv) => inv.id === invoiceId) || invoices[0]

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/invoices">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Invoices
          </Button>
        </Link>
        <ErrorState title="Invoice Not Found" message="The requested invoice record does not exist." />
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Invoices
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200 print:shadow-none print:border-none print:p-0 print:bg-white print:text-slate-800">
        {/* Top Header: Business Branding & Invoice No */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 print:border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white font-black text-lg flex items-center justify-center">
                M
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-slate-100 tracking-tight print:text-slate-900">
                MiniBiz<span className="text-brand-600 dark:text-brand-400 print:text-brand-600">Pay</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">{merchant?.businessName || 'MiniBiz Merchant'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">{merchant?.category || 'Retail & Services'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">Contact: {merchant?.mobile || 'N/A'} • {merchant?.email || 'N/A'}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 rounded-md uppercase tracking-wider mb-2 print:bg-slate-100 print:text-slate-700">
              TAX INVOICE
            </span>
            <p className="text-lg font-mono font-black text-slate-900 dark:text-slate-100 print:text-slate-900">{invoice.id}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">Invoice Date: {formatDate(invoice.date)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">Due Date: {formatDate(invoice.dueDate)}</p>
            <div className="mt-2">
              <StatusBadge status={invoice.paymentStatus} />
            </div>
          </div>
        </div>

        {/* Billed To / Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">BILLED TO:</span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm print:text-slate-900">{invoice.customerName}</p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 print:text-slate-600">{invoice.customerMobile}</p>
            {invoice.customerEmail && <p className="text-slate-600 dark:text-slate-400 print:text-slate-600">{invoice.customerEmail}</p>}
            {invoice.customerAddress && <p className="text-slate-500 dark:text-slate-400 mt-1 print:text-slate-500">{invoice.customerAddress}</p>}
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">ORDER METADATA:</span>
            <p className="text-slate-700 dark:text-slate-300 print:text-slate-700">Order Ref: <span className="font-mono font-bold text-brand-600 dark:text-brand-400 print:text-brand-600">{invoice.orderId}</span></p>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 print:text-slate-700">Platform: MiniBiz Pay Merchant Commerce</p>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 print:text-slate-700">Payment Terms: Advance Deposit + Balance on Delivery</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
              <tr>
                <th className="py-3 px-4">Item / Service Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-100">
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900 max-w-xs">{invoice.productService}</td>
                <td className="py-4 px-4 text-center font-medium">{1}</td>
                <td className="py-4 px-4 text-right font-medium">{formatCurrency(invoice.totalAmount)}</td>
                <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-200">
          {/* QR Code Mock for UPI */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-600">
              <p className="font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">Scan to Pay Balance</p>
              <p className="text-slate-500 dark:text-slate-400 print:text-slate-500">UPI ID: merchant@minibizpay</p>
              <p className="font-bold text-rose-600 dark:text-rose-400 print:text-rose-600 mt-1">Due: {formatCurrency(invoice.balanceAmount)}</p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 print:border-slate-100">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 font-medium">Total Amount:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 print:border-slate-100">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 font-medium">Advance Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-600">-{formatCurrency(invoice.advanceAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-900 dark:border-slate-100 print:border-slate-900 text-sm">
              <span className="font-black text-slate-900 dark:text-slate-100 print:text-slate-900">Balance Due:</span>
              <span className="font-black text-rose-600 dark:text-rose-400 print:text-rose-600">{formatCurrency(invoice.balanceAmount)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 print:border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600 dark:text-slate-400 print:text-slate-600">Thank you for your business!</p>
          <p>This is a computer-generated invoice issued via MiniBiz Pay application.</p>
        </div>
      </div>
    </div>
  )
}
