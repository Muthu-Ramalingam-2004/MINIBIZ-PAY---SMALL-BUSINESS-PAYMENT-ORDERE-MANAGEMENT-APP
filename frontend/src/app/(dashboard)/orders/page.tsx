'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { SearchBar } from '@/components/ui/search-bar'
import { FilterBar } from '@/components/ui/filter-bar'
import { StatusBadge } from '@/components/domain/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Eye, ShoppingBag, Send, Share2 } from 'lucide-react'
import { OrderStatus, PaymentStatus } from '@/types'
import { WhatsAppModal } from '@/components/domain/whatsapp-modal'
import { PaymentLinkModal } from '@/components/domain/payment-link-modal'

export default function OrdersPage() {
  const { orders, merchant } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; name: string; mobile: string; message: string } | null>(null)
  const [paymentLinkModal, setPaymentLinkModal] = useState<{ isOpen: boolean; name: string; amount: number; orderId: string } | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.productService.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Manage business orders, advance deposits, and delivery schedules"
        action={
          <Link href="/orders/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by Order ID, customer, product..." className="max-w-md" />

        <FilterBar
          filters={[
            {
              key: 'orderStatus',
              label: 'Order Status',
              value: statusFilter,
              options: [
                { label: 'All Order Statuses', value: 'all' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Confirmed', value: 'Confirmed' },
                { label: 'Preparing', value: 'Preparing' },
                { label: 'Ready', value: 'Ready' },
                { label: 'Delivered', value: 'Delivered' },
                { label: 'Completed', value: 'Completed' },
                { label: 'Cancelled', value: 'Cancelled' },
              ],
              onChange: setStatusFilter,
            },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              value: paymentFilter,
              options: [
                { label: 'All Payment Statuses', value: 'all' },
                { label: 'Unpaid', value: 'Unpaid' },
                { label: 'Advance Paid', value: 'Advance Paid' },
                { label: 'Fully Paid', value: 'Fully Paid' },
              ],
              onChange: setPaymentFilter,
            },
          ]}
          onClearAll={() => {
            setStatusFilter('all')
            setPaymentFilter('all')
            setSearch('')
          }}
        />
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title="No orders found"
          description="Create your first customer order to track advance payments and delivery status."
          actionLabel="Create Order"
          onAction={() => (window.location.href = '/orders/new')}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product / Service</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Advance</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold text-brand-600">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.customerMobile}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium text-slate-700">{order.productService}</TableCell>
                    <TableCell className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">{formatCurrency(order.advanceAmount)}</TableCell>
                    <TableCell className="font-bold text-rose-600">{formatCurrency(order.balanceAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {formatDate(order.deliveryDate)}
                      <span className="block text-[10px] text-slate-400">{order.deliveryTime}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-8 text-emerald-600"
                          title="WhatsApp Share"
                          onClick={() =>
                            setWhatsappModal({
                              isOpen: true,
                              name: order.customerName,
                              mobile: order.customerMobile,
                              message: `Hi ${order.customerName}, here is the update regarding your order #${order.id} (${order.productService}) with ${merchant.businessName}. Total: ${formatCurrency(order.totalAmount)}, Advance Paid: ${formatCurrency(order.advanceAmount)}, Balance Due: ${formatCurrency(order.balanceAmount)}.`,
                            })
                          }
                        >
                          <Send className="w-4 h-4" />
                        </Button>

                        {order.balanceAmount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 h-8 text-brand-600"
                            title="Generate Payment Link"
                            onClick={() =>
                              setPaymentLinkModal({
                                isOpen: true,
                                name: order.customerName,
                                amount: order.balanceAmount,
                                orderId: order.id,
                              })
                            }
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}

                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5 h-8">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
