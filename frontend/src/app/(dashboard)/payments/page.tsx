'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, CreditCard, Send, Share2, Copy, Check, ExternalLink, Clock, CheckCircle2 } from 'lucide-react'
import { PaymentLinkModal } from '@/components/domain/payment-link-modal'
import { WhatsAppModal } from '@/components/domain/whatsapp-modal'

export default function PaymentsPage() {
  const { paymentLinks, orders, transactions, merchant } = useApp()
  const [activeTab, setActiveTab] = useState<'links' | 'pending' | 'transactions'>('links')

  const [paymentLinkModal, setPaymentLinkModal] = useState(false)
  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; name: string; mobile: string; message: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const pendingOrders = orders.filter((o) => o.balanceAmount > 0)

  const handleCopy = (linkUrl: string, id: string) => {
    navigator.clipboard.writeText(linkUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage mock payment links, collect advance balances, and view transaction history"
        action={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPaymentLinkModal(true)}>
            Generate Payment Link
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('links')}
          className={`pb-3 text-xs font-bold transition-colors relative ${
            activeTab === 'links' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Payment Links ({paymentLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-xs font-bold transition-colors relative ${
            activeTab === 'pending' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Payments ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-xs font-bold transition-colors relative ${
            activeTab === 'transactions' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Payment Links */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Payment Links</CardTitle>
              <p className="text-xs text-slate-500">MOCK links for advance and balance collections</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Link ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-mono font-bold text-brand-600">{link.id}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{link.customerName}</TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">{link.description}</TableCell>
                      <TableCell className="font-bold text-slate-900">{formatCurrency(link.amount)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            link.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : link.status === 'Active'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {link.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{link.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 h-8 text-slate-600"
                            onClick={() => handleCopy(link.linkUrl, link.id)}
                            title="Copy Mock Link"
                          >
                            {copiedId === link.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 h-8 text-emerald-600"
                            title="Share on WhatsApp"
                            onClick={() =>
                              setWhatsappModal({
                                isOpen: true,
                                name: link.customerName,
                                mobile: link.customerMobile || '+91 98765 43210',
                                message: `Hi ${link.customerName}, please pay ${formatCurrency(link.amount)} for ${link.description} using link: ${link.linkUrl}`,
                              })
                            }
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>

                          <Link href={`/payment/${link.orderId || 'ORD-1001'}`} target="_blank">
                            <Button variant="ghost" size="sm" className="p-1.5 h-8 text-brand-600" title="Open Payment Page">
                              <ExternalLink className="w-4 h-4" />
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
        </div>
      )}

      {/* Tab 2: Pending Payments */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders with Pending Balance</CardTitle>
              <p className="text-xs text-slate-500">Send WhatsApp payment reminders directly to clients</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Advance Paid</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-bold text-brand-600">{order.id}</TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.customerMobile}</p>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">{formatCurrency(order.advanceAmount)}</TableCell>
                      <TableCell className="text-rose-600 font-bold text-base">{formatCurrency(order.balanceAmount)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{formatDate(order.deliveryDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="success"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() =>
                            setWhatsappModal({
                              isOpen: true,
                              name: order.customerName,
                              mobile: order.customerMobile,
                              message: `Hi ${order.customerName}, this is a gentle reminder regarding your pending payment of ${formatCurrency(order.balanceAmount)} for Order #${order.id} with ${merchant?.businessName || 'MiniBiz Merchant'}. Please complete your payment here: https://minibizpay.app/payment/${order.id}`,
                            })
                          }
                        >
                          Send WhatsApp Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Mock Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono font-bold text-slate-900">{txn.id}</TableCell>
                    <TableCell className="font-mono text-brand-600">{txn.orderId}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{txn.customerName}</TableCell>
                    <TableCell className="font-bold text-emerald-600 text-base">{formatCurrency(txn.amount)}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{txn.paymentType}</TableCell>
                    <TableCell className="text-xs text-slate-600">{txn.paymentMethod}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                        {txn.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{txn.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Link Modal */}
      <PaymentLinkModal isOpen={paymentLinkModal} onClose={() => setPaymentLinkModal(false)} />

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
    </div>
  )
}
