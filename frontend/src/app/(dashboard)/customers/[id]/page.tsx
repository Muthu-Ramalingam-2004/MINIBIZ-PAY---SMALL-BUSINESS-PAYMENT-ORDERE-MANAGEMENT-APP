'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, FileText, ShoppingBag, Eye, Plus } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params?.id as string
  const { customers, orders, transactions } = useApp()

  const customer = customers.find((c) => c.id === customerId)
  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/customers">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Customers
          </Button>
        </Link>
        <ErrorState title="Customer Not Found" message="The requested customer profile does not exist or has been removed." />
      </div>
    )
  }

  const customerOrders = orders.filter((o) => o.customerId === customer.id || o.customerName === customer.name)
  const customerTxns = transactions.filter((t) => customerOrders.some((o) => o.id === t.orderId))

  return (
    <div className="space-y-6">
      <Link href="/customers">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Customers
        </Button>
      </Link>

      <PageHeader
        title={customer.name}
        subtitle={`Customer ID: ${customer.id} • Member since ${formatDate(customer.createdAt)}`}
        action={
          <Link href="/orders/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order for {customer.name.split(' ')[0]}
            </Button>
          </Link>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{customerOrders.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(customer.totalSpent)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Balance</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(customer.pendingAmount)}</p>
        </Card>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{customer.mobile}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{customer.email || 'No email provided'}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <span>{customer.address || 'No address provided'}</span>
            </div>
          </div>
          <div>
            <span className="font-semibold text-slate-900 block mb-1">Customer Preferences & Notes:</span>
            <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 leading-relaxed italic">
              {customer.notes || 'No special notes logged for this customer.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customerOrders.length === 0 ? (
            <p className="p-6 text-xs text-center text-slate-500">No past orders for this customer yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product / Service</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Advance Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold text-brand-600">{order.id}</TableCell>
                    <TableCell className="font-medium text-slate-800">{order.productService}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="text-emerald-600 font-semibold">{formatCurrency(order.advanceAmount)}</TableCell>
                    <TableCell className="text-rose-600 font-semibold">{formatCurrency(order.balanceAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Audit History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment & Transaction Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customerTxns.length === 0 ? (
            <p className="p-6 text-xs text-center text-slate-500">No mock transactions recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerTxns.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono font-semibold text-slate-800">{txn.id}</TableCell>
                    <TableCell className="font-mono text-brand-600">{txn.orderId}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{formatCurrency(txn.amount)}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{txn.paymentType}</TableCell>
                    <TableCell className="text-xs text-slate-600">{txn.paymentMethod}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                        {txn.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{txn.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
