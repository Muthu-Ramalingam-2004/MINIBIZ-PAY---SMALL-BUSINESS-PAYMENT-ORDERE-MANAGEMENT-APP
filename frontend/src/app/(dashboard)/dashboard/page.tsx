'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ShoppingBag, IndianRupee, Clock, CalendarCheck, TrendingUp, ArrowUpRight, Eye, Send, Share2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { WhatsAppModal } from '@/components/domain/whatsapp-modal'
import { PaymentLinkModal } from '@/components/domain/payment-link-modal'

const CHART_DATA = [
  { day: 'Mon', sales: 12000, collection: 8500 },
  { day: 'Tue', sales: 18500, collection: 14000 },
  { day: 'Wed', sales: 15000, collection: 11200 },
  { day: 'Thu', sales: 24000, collection: 19500 },
  { day: 'Fri', sales: 32000, collection: 28000 },
  { day: 'Sat', sales: 45000, collection: 41000 },
  { day: 'Sun', sales: 22000, collection: 18000 },
]

export default function DashboardPage() {
  const { merchant, orders, theme } = useApp()
  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; name: string; mobile: string; message: string } | null>(null)
  const [paymentLinkModal, setPaymentLinkModal] = useState<{ isOpen: boolean; name: string; amount: number; orderId: string } | null>(null)

  // Calculations
  const todayOrdersCount = orders.length
  const todayCollection = orders.reduce((sum, o) => sum + o.advanceAmount, 0)
  const pendingPayments = orders.reduce((sum, o) => sum + o.balanceAmount, 0)
  const upcomingBookingsCount = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing').length
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Good morning, ${merchant?.ownerName || 'Merchant'}`}
        subtitle="Here's what's happening with your business today."
        action={
          <Link href="/orders/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
        }
      />

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{todayOrdersCount}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +15% from yesterday
          </span>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Collection</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(todayCollection)}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 88% advance rate
          </span>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(pendingPayments)}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Due before delivery</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{upcomingBookingsCount}</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1 block">Next 7 days</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(totalSales)}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">All-time revenue</span>
        </Card>
      </div>

      {/* Sales Trend Chart & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales & Collection Trend</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Weekly total orders vs collected advance revenue</p>
            </div>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  itemStyle={{ color: isDark ? '#cbd5e1' : '#334155' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="collection" name="Collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollection)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <Link href="/bookings" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{order.customerName}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{order.productService}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{formatDate(order.deliveryDate)} at {order.deliveryTime}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    leftIcon={<Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    onClick={() =>
                      setWhatsappModal({
                        isOpen: true,
                        name: order.customerName,
                        mobile: order.customerMobile,
                        message: `Hi ${order.customerName}, this is a reminder from ${merchant?.businessName || 'MiniBiz Pay'} regarding your order #${order.id} scheduled for ${formatDate(order.deliveryDate)} at ${order.deliveryTime}.`,
                      })
                    }
                  >
                    Reminder
                  </Button>

                  {order.balanceAmount > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-7 text-[11px] px-2"
                      leftIcon={<Share2 className="w-3 h-3" />}
                      onClick={() =>
                        setPaymentLinkModal({
                          isOpen: true,
                          name: order.customerName,
                          amount: order.balanceAmount,
                          orderId: order.id,
                        })
                      }
                    >
                      Pay Link
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest order transactions and payment status</p>
          </div>
          <Link href="/orders">
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product / Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-bold text-brand-600 dark:text-brand-400">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{order.customerMobile}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium text-slate-700 dark:text-slate-300">{order.productService}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.totalAmount)}</div>
                    {order.balanceAmount > 0 && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">Bal: {formatCurrency(order.balanceAmount)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    {formatDate(order.deliveryDate)}
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">{order.deliveryTime}</span>
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
        </CardContent>
      </Card>

      {/* WhatsApp Modal */}
      {whatsappModal && (
        <WhatsAppModal
          isOpen={whatsappModal.isOpen}
          onClose={() => setWhatsappModal(null)}
          customerName={whatsappModal.name}
          mobile={whatsappModal.mobile}
          message={whatsappModal.message}
        />
      )}

      {/* Payment Link Modal */}
      {paymentLinkModal && (
        <PaymentLinkModal
          isOpen={paymentLinkModal.isOpen}
          onClose={() => setPaymentLinkModal(null)}
          defaultCustomerName={paymentLinkModal.name}
          defaultAmount={paymentLinkModal.amount}
          orderId={paymentLinkModal.orderId}
        />
      )}
    </div>
  )
}
