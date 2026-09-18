'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Menu, Bell, Search, Store, User, LogOut, Settings, HelpCircle, ChevronDown, Check, Sun, Moon } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { NAV_ITEMS } from './sidebar'
import { cn } from '@/lib/utils'

export function TopHeader() {
  const pathname = usePathname()
  const { merchant, sidebarOpen, setSidebarOpen, orders, logout, theme, toggleTheme } = useApp()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [businessOpen, setBusinessOpen] = useState(false)

  // Generate page title from route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname.startsWith('/orders/new')) return 'Create Order'
    if (pathname.startsWith('/orders/')) return 'Order Details'
    if (pathname.startsWith('/orders')) return 'Orders'
    if (pathname.startsWith('/bookings')) return 'Bookings'
    if (pathname.startsWith('/customers/')) return 'Customer Profile'
    if (pathname.startsWith('/customers')) return 'Customers'
    if (pathname.startsWith('/payments/links')) return 'Payment Links'
    if (pathname.startsWith('/payments/pending')) return 'Pending Payments'
    if (pathname.startsWith('/payments/transactions')) return 'Transaction History'
    if (pathname.startsWith('/payments')) return 'Payments'
    if (pathname.startsWith('/invoices/')) return 'Invoice View'
    if (pathname.startsWith('/invoices')) return 'Invoices'
    if (pathname.startsWith('/calendar')) return 'Calendar'
    if (pathname.startsWith('/reports')) return 'Reports & Analytics'
    if (pathname.startsWith('/settings')) return 'Settings'
    if (pathname.startsWith('/admin')) return 'Admin Dashboard'
    return 'Dashboard'
  }

  const pendingCount = orders.filter((o) => o.paymentStatus !== 'Fully Paid').length

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
        {/* Mobile menu button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">{getPageTitle()}</h1>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              MiniBiz Pay / {getPageTitle()}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-48 sm:w-64 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">Search orders, customers...</span>
            <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Business Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setBusinessOpen(!businessOpen)
                setNotificationsOpen(false)
                setProfileOpen(false)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <Store className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate">{merchant?.businessName || 'Sweet Treats Bakery'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </button>

            {businessOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800 py-2 z-40">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Business
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <span className="truncate">{merchant?.businessName || 'Sweet Treats Bakery'}</span>
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  Category: {merchant?.category || 'Home Baker'}
                </div>
              </div>
            )}
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
                setBusinessOpen(false)
              }}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800 p-3 z-40">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
                  <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {pendingCount} Pending
                  </span>
                </div>
                <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                  {orders.slice(0, 3).map((o) => (
                    <div key={o.id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName} - {o.id}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Balance: ₹{o.balanceAmount} due on {o.deliveryDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationsOpen(false)
                setBusinessOpen(false)
              }}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {merchant?.ownerName ? merchant.ownerName.charAt(0) : 'P'}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800 py-1 z-40">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{merchant?.ownerName || 'Priya Sharma'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{merchant?.email || 'priya@sweettreats.com'}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Account Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="MiniBiz Pay Menu" position="left">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all',
                  isActive ? 'bg-brand-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
            >
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  )
}
