'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Eye } from 'lucide-react'
import { Order } from '@/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const { orders } = useApp()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentMonth, setCurrentMonth] = useState('September 2026')

  // September 2026 month days (30 days, Sept 1 2026 is Tuesday)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)
  const offset = 2 // Sept 1 is Tuesday (0=Sun, 1=Mon, 2=Tue)

  const getOrdersForDay = (dayNum: number) => {
    const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`
    return orders.filter((o) => o.deliveryDate === dateStr)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Visual monthly calendar view of bookings and delivery deadlines"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Prev
            </Button>
            <span className="text-sm font-bold text-slate-900 px-3">{currentMonth}</span>
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 min-h-[500px]">
            {/* Blank Offsets */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/40 dark:bg-slate-950/40 p-2 min-h-[100px]" />
            ))}

            {/* Days 1 to 30 */}
            {daysInMonth.map((day) => {
              const dayOrders = getOrdersForDay(day)
              const isToday = day === 19 // Demo today is Sept 19

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[110px] flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-brand-50/40 dark:bg-brand-950/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayOrders.length > 0 && (
                      <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/60 px-1.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                        {dayOrders.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-y-auto max-h-[80px]">
                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-brand-400 dark:hover:border-brand-500 cursor-pointer transition-all"
                      >
                        <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{order.productService}</p>
                        <div className="flex items-center justify-between text-[10px] mt-1">
                          <span className="font-semibold text-brand-600 dark:text-brand-400">{order.deliveryTime}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Popover Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Booking: ${selectedOrder.customerName}`}
          subtitle={`Order #${selectedOrder.id}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedOrder.orderStatus} />
              <StatusBadge status={selectedOrder.paymentStatus} />
            </div>

            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{selectedOrder.customerName} ({selectedOrder.customerMobile})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatDate(selectedOrder.deliveryDate)} at {selectedOrder.deliveryTime}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100 flex justify-between">
                <span>Total Booking Value:</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Link href={`/orders/${selectedOrder.id}`}>
                <Button variant="primary" leftIcon={<Eye className="w-4 h-4" />}>
                  View Full Order
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
