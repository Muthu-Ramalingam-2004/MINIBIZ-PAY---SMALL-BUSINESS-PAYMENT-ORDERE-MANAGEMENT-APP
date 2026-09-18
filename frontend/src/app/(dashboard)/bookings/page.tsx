'use client'

import React, { useState } from 'react'
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
  const { orders } = useApp()
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const filteredBookings = orders.filter((o) => {
    if (filter === 'completed') return o.orderStatus === 'Completed' || o.orderStatus === 'Delivered'
    if (filter === 'cancelled') return o.orderStatus === 'Cancelled'
    if (filter === 'today') return o.deliveryDate === '2026-09-19' || o.deliveryDate === new Date().toISOString().split('T')[0]
    if (filter === 'upcoming') return o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing' || o.orderStatus === 'Ready'
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
                  <TableCell className="font-mono font-bold text-brand-600">{booking.id}</TableCell>
                  <TableCell className="font-medium text-slate-700 max-w-xs truncate">{booking.productService}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatDate(booking.deliveryDate)}</TableCell>
                  <TableCell className="text-xs text-slate-600 flex items-center gap-1 py-4">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {booking.deliveryTime}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={booking.orderStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${booking.id}`}>
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
