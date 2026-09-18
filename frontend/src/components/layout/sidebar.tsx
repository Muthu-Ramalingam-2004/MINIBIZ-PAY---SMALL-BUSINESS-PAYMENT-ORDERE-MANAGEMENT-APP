'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/app-context'
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  Users,
  CreditCard,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { merchant, logout } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 relative border-r border-slate-800 z-30 shrink-0 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base tracking-tight leading-none truncate">
                MiniBiz<span className="text-brand-400">Pay</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Payment & Order Manager</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all relative group',
                isActive
                  ? 'bg-brand-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}

        <div className="pt-3 my-2 border-t border-slate-800/80">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-amber-400 hover:bg-slate-800/80',
              pathname.startsWith('/admin') && 'bg-amber-500/20 text-amber-300 font-bold'
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            {!collapsed && <span>Admin Console</span>}
          </Link>
        </div>
      </div>

      {/* Footer Profile & Help */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <div className={cn('flex items-center justify-between p-2 rounded-lg bg-slate-800/50 mt-2', collapsed && 'justify-center')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {merchant?.ownerName ? merchant.ownerName.charAt(0) : 'M'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 truncate">{merchant?.ownerName || 'Merchant'}</span>
                <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <Store className="w-2.5 h-2.5" />
                  {merchant?.businessName || 'Business'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={logout} className="text-slate-400 hover:text-rose-400 p-1" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
