'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/domain/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye, Printer, Send, FileText } from 'lucide-react'
import { WhatsAppModal } from '@/components/domain/whatsapp-modal'

export default function InvoicesPage() {
  const { invoices, merchant } = useApp()
  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; name: string; mobile: string; message: string } | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Generate, download, and share professional printable billing invoices" />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Advance Paid</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">{inv.id}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{inv.customerMobile}</p>
                  </TableCell>
                  <TableCell className="font-mono text-brand-600 dark:text-brand-400">{inv.orderId}</TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(inv.totalAmount)}</TableCell>
                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(inv.advanceAmount)}</TableCell>
                  <TableCell className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(inv.balanceAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">{formatDate(inv.date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" className="p-1.5 h-8 text-slate-600 dark:text-slate-400">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 h-8 text-emerald-600 dark:text-emerald-400"
                        onClick={() =>
                          setWhatsappModal({
                            isOpen: true,
                            name: inv.customerName,
                            mobile: inv.customerMobile,
                            message: `Hi ${inv.customerName}, here is your tax invoice ${inv.id} for Order #${inv.orderId} from ${merchant?.businessName || 'MiniBiz Merchant'}. Total: ${formatCurrency(inv.totalAmount)}, Balance Due: ${formatCurrency(inv.balanceAmount)}. View full invoice: https://minibizpay.app/invoices/${inv.id}`,
                          })
                        }
                      >
                        <Send className="w-4 h-4" />
                      </Button>

                      <Link href={`/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" className="p-1.5 h-8 text-brand-600 dark:text-brand-400">
                          <Printer className="w-4 h-4" />
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
