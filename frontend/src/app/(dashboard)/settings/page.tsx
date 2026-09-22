'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculatePlatformFee } from '@/lib/utils'
import { Store, Percent, Bell, Sun, Moon, Lock, ShieldCheck, Check } from 'lucide-react'

export default function SettingsPage() {
  const { merchant, updateMerchant, addToast, theme, toggleTheme } = useApp()
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'notifications' | 'appearance' | 'account'>('profile')

  // Profile state
  const [businessName, setBusinessName] = useState(merchant?.businessName || '')
  const [ownerName, setOwnerName] = useState(merchant?.ownerName || '')
  const [mobile, setMobile] = useState(merchant?.mobile || '')
  const [email, setEmail] = useState(merchant?.email || '')
  const [category, setCategory] = useState(merchant?.category || '')

  // Payment settings state
  const [feePercent, setFeePercent] = useState<number>(merchant?.platformFeePercent || 1.0)
  const [testAmount, setTestAmount] = useState<number>(10000)

  // Sync form inputs whenever merchant profile changes or loads
  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.businessName || '')
      setOwnerName(merchant.ownerName || '')
      setMobile(merchant.mobile || '')
      setEmail(merchant.email || '')
      setCategory(merchant.category || '')
      setFeePercent(merchant.platformFeePercent || 1.0)
    }
  }, [merchant])

  // Notifications state
  const [paymentReminders, setPaymentReminders] = useState(true)
  const [orderConfirmations, setOrderConfirmations] = useState(true)
  const [bookingReminders, setBookingReminders] = useState(true)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateMerchant({ businessName, ownerName, mobile, email, category })
  }

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault()
    updateMerchant({ platformFeePercent: Number(feePercent) })
  }

  const calculatedFee = calculatePlatformFee(testAmount, feePercent)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure business profile, platform fees, notifications, and preferences" />

      {/* Tab Nav */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-6">
        {[
          { id: 'profile', label: 'Business Profile', icon: Store },
          { id: 'payment', label: 'Payment & Platform Fee', icon: Percent },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'appearance', label: 'Appearance', icon: Sun },
          { id: 'account', label: 'Account Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Business Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input label="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              <Input label="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
              <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Business Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Home Baker, Boutique" required />

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Platform Fee UI */}
      {activeTab === 'payment' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Platform Fee Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSaveFee} className="space-y-4">
                <Input
                  label="Platform Fee (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  helperText="Configured fee percentage per transaction."
                />

                <Button variant="primary" type="submit">
                  Update Fee Percentage
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Interactive Fee Calculator Widget */}
          <Card className="border-brand-200 dark:border-brand-900/50 bg-brand-50/40 dark:bg-brand-950/20">
            <CardHeader>
              <CardTitle className="text-brand-900 dark:text-brand-300">Live Fee Calculation Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Sample Transaction Amount (₹)"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
              />

              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-brand-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Transaction Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(testAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Platform Fee Rate:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{feePercent}%</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">Calculated Platform Fee:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculatedFee)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Formula: <code>Platform Fee = Transaction Amount × Fee % / 100</code>. Display only (no automated payouts).</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Payment Reminders</p>
                <p className="text-slate-500 dark:text-slate-400">Send WhatsApp reminders for pending advance & balance payments</p>
              </div>
              <input
                type="checkbox"
                checked={paymentReminders}
                onChange={(e) => setPaymentReminders(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded dark:bg-slate-800 dark:border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Order Confirmations</p>
                <p className="text-slate-500 dark:text-slate-400">Auto-generate WhatsApp confirmation messages on booking creation</p>
              </div>
              <input
                type="checkbox"
                checked={orderConfirmations}
                onChange={(e) => setOrderConfirmations(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded dark:bg-slate-800 dark:border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Booking Alerts</p>
                <p className="text-slate-500 dark:text-slate-400">Notify 24 hours prior to delivery date</p>
              </div>
              <input
                type="checkbox"
                checked={bookingReminders}
                onChange={(e) => setBookingReminders(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded dark:bg-slate-800 dark:border-slate-700"
              />
            </label>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => addToast('Notification Preferences Saved', 'Settings updated.', 'success')}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Appearance */}
      {activeTab === 'appearance' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Theme & Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Current Theme Mode</p>
                <p className="text-slate-500 dark:text-slate-400">Switch between light and dark themes instantly without page reload.</p>
              </div>
              <Button
                variant={isDark ? 'primary' : 'outline'}
                leftIcon={isDark ? <Moon className="w-4 h-4 text-indigo-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
                onClick={toggleTheme}
              >
                {isDark ? 'Dark Theme (Active)' : 'Light Theme (Active)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Account Security */}
      {activeTab === 'account' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => addToast('Password Updated', 'Mock account security saved.', 'success')}>
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
