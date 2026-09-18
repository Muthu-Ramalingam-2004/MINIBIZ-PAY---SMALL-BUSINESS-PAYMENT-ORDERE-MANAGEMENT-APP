'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Store, TrendingUp, IndianRupee, Users, ShieldCheck, ArrowUpRight } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

const ADMIN_CHART_DATA = [
  { month: 'Apr', volume: 450000, revenue: 4500, merchants: 42 },
  { month: 'May', volume: 680000, revenue: 6800, merchants: 68 },
  { month: 'Jun', volume: 920000, revenue: 9200, merchants: 95 },
  { month: 'Jul', volume: 1450000, revenue: 14500, merchants: 130 },
  { month: 'Aug', volume: 2100000, revenue: 21000, merchants: 184 },
  { month: 'Sep', volume: 2850000, revenue: 28500, merchants: 240 },
]

const MERCHANTS_LIST = [
  { name: 'Sweet Treats Bakery & Crafts', category: 'Home Baker', orders: 48, gmv: 148500, fee: 1485, status: 'Active' },
  { name: 'Artisan Pottery Studio', category: 'Boutique Service', orders: 32, gmv: 98000, fee: 980, status: 'Active' },
  { name: 'Glamour Thread Sarees', category: 'Instagram Seller', orders: 64, gmv: 240000, fee: 2400, status: 'Active' },
  { name: 'Math & Coding Academy', category: 'Freelance Tutor', orders: 20, gmv: 60000, fee: 600, status: 'Active' },
  { name: 'Bloom & Co Floralfavors', category: 'Event Services', orders: 15, gmv: 45000, fee: 450, status: 'Active' },
]

export default function AdminPage() {
  const { theme } = useApp()
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
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Administration Console</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Global SaaS metrics across all registered merchants</p>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Merchants</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">240</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+12 this week</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">3,420</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">99.2% success</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Transactions</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">5,890</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total GMV Volume</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹28.5L</p>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/40 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">Platform Revenue</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹28,500</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">At 1.0% avg fee</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Merchants</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">218</p>
        </div>
      </div>

      {/* Admin Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Transaction Volume (GMV)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADMIN_CHART_DATA}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'GMV Volume']} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="url(#volGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Fee Revenue (1.0%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ADMIN_CHART_DATA}>
                <XAxis dataKey="month" stroke={axisStroke} fontSize={12} />
                <YAxis stroke={axisStroke} fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Merchant Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Merchant Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total GMV</th>
                <th className="py-3 px-4">Fee Earned</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MERCHANTS_LIST.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{m.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{m.orders}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">{formatCurrency(m.gmv)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(m.fee)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-500/30 text-[10px]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
