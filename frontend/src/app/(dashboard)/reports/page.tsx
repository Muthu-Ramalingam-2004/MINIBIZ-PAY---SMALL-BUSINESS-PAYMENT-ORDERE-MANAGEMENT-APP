'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, IndianRupee, Clock, ShoppingBag, Users } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const MONTHLY_SALES_DATA = [
  { month: 'Apr', sales: 42000, collection: 38000 },
  { month: 'May', sales: 58000, collection: 51000 },
  { month: 'Jun', sales: 65000, collection: 60000 },
  { month: 'Jul', sales: 88000, collection: 82000 },
  { month: 'Aug', sales: 112000, collection: 105000 },
  { month: 'Sep', sales: 148500, collection: 136000 },
]

const STATUS_DISTRIBUTION = [
  { name: 'Completed', value: 18, color: '#10b981' },
  { name: 'Confirmed', value: 12, color: '#2563eb' },
  { name: 'Preparing', value: 5, color: '#0ea5e9' },
  { name: 'Ready', value: 4, color: '#6366f1' },
  { name: 'Pending', value: 3, color: '#f59e0b' },
]

export default function ReportsPage() {
  const { orders, customers, theme } = useApp()

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalCollected = orders.reduce((sum, o) => sum + o.advanceAmount, 0)
  const totalPending = orders.reduce((sum, o) => sum + o.balanceAmount, 0)

  const isDark = theme === 'dark'
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#fff',
    borderRadius: '8px',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
  }
  const axisStroke = isDark ? '#64748b' : '#94a3b8'

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Financial analytics, revenue trends, and collection breakdown" />

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Sales</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalSales)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Collected</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Pending</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-600">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{orders.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-sky-500">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Customers</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{customers.length}</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Collection Growth Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Collection Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SALES_DATA}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Total Sales" stroke="#2563eb" fill="url(#salesGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="collection" name="Realized Collection" stroke="#10b981" fill="url(#collectGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Collection Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Advance vs Balance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SALES_DATA}>
                <XAxis dataKey="month" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="collection" name="Advance Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" name="Total Booking Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Fulfillment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4 flex flex-col md:flex-row items-center justify-around">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={STATUS_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {STATUS_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

