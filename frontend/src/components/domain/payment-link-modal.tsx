'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/app-context'
import { Copy, Share2, ExternalLink, ShieldCheck, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentLinkModalProps {
  isOpen: boolean
  onClose: () => void
  defaultCustomerName?: string
  defaultAmount?: number
  defaultDescription?: string
  orderId?: string
}

export function PaymentLinkModal({
  isOpen,
  onClose,
  defaultCustomerName = 'Rahul Kumar',
  defaultAmount = 500,
  defaultDescription = 'Advance Payment for Order #ORD-1001',
  orderId = 'ORD-1001',
}: PaymentLinkModalProps) {
  const { generatePaymentLink, addToast } = useApp()
  const [customerName, setCustomerName] = useState(defaultCustomerName)
  const [amount, setAmount] = useState(defaultAmount)
  const [description, setDescription] = useState(defaultDescription)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!customerName || !amount) {
      addToast('Validation Error', 'Please enter customer name and valid amount.', 'error')
      return
    }
    const link = await generatePaymentLink(customerName, Number(amount), description, orderId)
    setGeneratedLink(link.linkUrl)
  }

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      addToast('Link Copied', 'Mock payment link copied to clipboard.', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    const text = `Hi ${customerName}, please complete your payment of ${formatCurrency(amount)} for ${description} using this link: ${generatedLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleOpenPage = () => {
    if (orderId) {
      window.open(`/payment/${orderId}`, '_blank')
    }
  }

  const handleReset = () => {
    setGeneratedLink(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Generate Payment Link" subtitle="Create mock payment request link" maxWidth="md">
      {!generatedLink ? (
        <div className="space-y-4">
          <Input label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          <Input label="Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Advance payment for cake order" />

          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Clearly labelled as <strong>MOCK PAYMENT</strong> for UI testing.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleGenerate}>Generate Link</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full mb-2">
              MOCK PAYMENT LINK GENERATED
            </span>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">For: {customerName}</p>

            <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono text-brand-600 dark:text-brand-400 truncate select-all">
              {generatedLink}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} onClick={handleCopyLink}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="success" size="sm" leftIcon={<Share2 className="w-3.5 h-3.5" />} onClick={handleShareWhatsApp}>
              WhatsApp
            </Button>
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} onClick={handleOpenPage}>
              Open Page
            </Button>
          </div>

          <Button variant="ghost" className="w-full text-xs" onClick={handleReset}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}
