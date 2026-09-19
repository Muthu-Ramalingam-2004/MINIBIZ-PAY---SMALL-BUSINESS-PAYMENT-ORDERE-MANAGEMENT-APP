'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/domain/status-badge'
import { OrderTimeline } from '@/components/domain/order-timeline'
import { PaymentSummary } from '@/components/domain/payment-summary'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Send, Share2, FileText, CheckCircle2, XCircle, Phone, Mail, Calendar, Clock } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { WhatsAppModal } from '@/components/domain/whatsapp-modal'
import { PaymentLinkModal } from '@/components/domain/payment-link-modal'
import { OrderStatus } from '@/types'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params?.id as string
  const { orders, updateOrderStatus, merchant, invoices } = useApp()

  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null)
  const [paymentLinkModal, setPaymentLinkModal] = useState<boolean>(false)

  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    return (
      <div className="space-y-6">
        <Link href="/orders">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Orders
          </Button>
        </Link>
        <ErrorState title="Order Not Found" message="The requested order record could not be found." />
      </div>
    )
  }

  const matchingInvoice = invoices.find((inv) => inv.orderId === order.id)

  const handleSendConfirmation = () => {
    const text = `Hi ${order.customerName}, your order #${order.id} for ${order.productService} has been confirmed by ${merchant?.businessName || 'MiniBiz Merchant'}! Delivery scheduled for ${formatDate(order.deliveryDate)} at ${order.deliveryTime}.`
    setWhatsappModal({
      isOpen: true,
      title: 'Send Order Confirmation',
      message: text,
    })
  }

  const handleSendReminder = () => {
    const text = `Hi ${order.customerName}, this is a reminder regarding your pending payment of ${formatCurrency(order.balanceAmount)} for Order #${order.id} with ${merchant?.businessName || 'MiniBiz Merchant'}.`
    setWhatsappModal({
      isOpen: true,
      title: 'Send Payment Reminder',
      message: text,
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/orders">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Orders
        </Button>
      </Link>

      <PageHeader
        title={`Order #${order.id}`}
        subtitle={`Booked on ${formatDate(order.createdAt)} • ${order.customerName}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.orderStatus} />
          </div>
        }
      />

      {/* Visual Timeline Bar */}
      <OrderTimeline
        currentStatus={order.orderStatus}
        onStatusChange={(newStatus: OrderStatus) => updateOrderStatus(order.id, newStatus)}
      />

      {/* Quick Action Bar */}
      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quick Actions:</span>
          <div className="flex flex-wrap items-center gap-2">
            {order.balanceAmount > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => setPaymentLinkModal(true)}
              >
                Generate Payment Link
              </Button>
            )}

            {order.balanceAmount > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                onClick={handleSendReminder}
              >
                Send Reminder
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              onClick={handleSendConfirmation}
            >
              Send Confirmation
            </Button>

            <Link href={`/invoices/${matchingInvoice?.id || 'INV-2026-001'}`}>
              <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />}>
                Generate Invoice
              </Button>
            </Link>

            {order.orderStatus !== 'Cancelled' && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={() => updateOrderStatus(order.id, 'Cancelled')}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order & Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Customer</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{order.customerName}</p>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customerMobile}
                </p>
                {order.customerEmail && (
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.customerEmail}
                  </p>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase">Delivery / Service Schedule</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" /> {formatDate(order.deliveryDate)}
                </p>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {order.deliveryTime}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold uppercase block">Product / Service Item</span>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{order.productService}</p>
                {order.notes && <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{order.notes}"</p>}
              </div>
            </div>

            {/* Quick Status Setter */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Update Order Status:</span>
              <div className="flex flex-wrap gap-2">
                {(['Confirmed', 'Preparing', 'Ready', 'Delivered', 'Completed'] as OrderStatus[]).map((st) => (
                  <Button
                    key={st}
                    variant={order.orderStatus === st ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, st)}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <PaymentSummary
          totalAmount={order.totalAmount}
          advanceAmount={order.advanceAmount}
          balanceAmount={order.balanceAmount}
          paymentStatus={order.paymentStatus}
        />
      </div>

      {/* WhatsApp Modal */}
      {whatsappModal && (
        <WhatsAppModal
          isOpen={whatsappModal.isOpen}
          onClose={() => setWhatsappModal(null)}
          customerName={order.customerName}
          mobile={order.customerMobile}
          message={whatsappModal.message}
          title={whatsappModal.title}
        />
      )}

      {/* Payment Link Modal */}
      <PaymentLinkModal
        isOpen={paymentLinkModal}
        onClose={() => setPaymentLinkModal(false)}
        defaultCustomerName={order.customerName}
        defaultAmount={order.balanceAmount}
        defaultDescription={`Balance payment for Order #${order.id}`}
        orderId={order.id}
      />
    </div>
  )
}
