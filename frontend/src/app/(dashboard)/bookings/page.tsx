'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CalendarCheck, Clock, Calendar as CalendarIcon, Eye, Plus } from 'lucide-react'

export default function BookingsPage() {
  const { bookings, orders } = useApp()
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')

  // Combine bookings from DB/API with order bookings fallback
  const combinedBookings = useMemo(() => {
    const list: Array<{
      id: string
      orderId: string
      customerName: string
      customerMobile: string
      productService: string
      deliveryDate: string
      deliveryTime: string
      amount: number
      status: any
    }> = []

    const map = new Set<string>()

    for (const b of bookings) {
      const key = b.id || b.orderId || ''
      if (key && !map.has(key)) {
        map.add(key)
        list.push({
          id: b.id,
          orderId: b.orderId || b.id,
          customerName: b.customerName,
          customerMobile: b.customerMobile || '',
          productService: b.productService,
          deliveryDate: b.deliveryDate || b.date || '',
          deliveryTime: b.deliveryTime || b.time || '10:30 AM',
          amount: b.amount,
          status: b.status,
        })
      }
    }

    for (const o of orders) {
      const key = `BKG-${o.id}`
      if (!map.has(o.id) && !map.has(key)) {
        list.push({
          id: key,
          orderId: o.id,
          customerName: o.customerName,
          customerMobile: o.customerMobile,
          productService: o.productService,
          deliveryDate: o.deliveryDate,
          deliveryTime: o.deliveryTime,
          amount: o.totalAmount,
          status: o.orderStatus,
        })
      }
    }

    return list
  }, [bookings, orders])

  const filteredBookings = combinedBookings.filter((b) => {
    const todayStr = new Date().toISOString().split('T')[0]
    if (filter === 'completed') return b.status === 'Completed' || b.status === 'Delivered'
    if (filter === 'cancelled') return b.status === 'Cancelled'
    if (filter === 'today') return b.deliveryDate === todayStr || b.deliveryDate === '2026-09-19' || b.deliveryDate === '2026-09-22'
    if (filter === 'upcoming') return b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready' || b.status === 'Pending'
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Track upcoming service commitments, cake deliveries, and appointments"
        action={
          <Link href="/orders/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
        }
      />

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'upcoming', label: 'Upcoming Bookings' },
          { id: 'today', label: 'Today' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'all', label: 'All Bookings' },
        ].map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.id as typeof filter)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Service / Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-bold text-slate-900">{booking.customerName}</p>
                    <p className="text-[11px] text-slate-400">{booking.customerMobile}</p>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-brand-600">{booking.orderId}</TableCell>
                  <TableCell className="font-medium text-slate-700 max-w-xs truncate">{booking.productService}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatDate(booking.deliveryDate)}</TableCell>
                  <TableCell className="text-xs text-slate-600 flex items-center gap-1 py-4">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {booking.deliveryTime}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{formatCurrency(booking.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${booking.orderId}`}>
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

