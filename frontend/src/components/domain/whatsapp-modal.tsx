'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { MessageSquare, Copy, ExternalLink, Check } from 'lucide-react'
import { useApp } from '@/context/app-context'

interface WhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  customerName: string
  mobile: string
  message: string
  title?: string
}

export function WhatsAppModal({ isOpen, onClose, customerName, mobile, message, title = 'WhatsApp Action' }: WhatsAppModalProps) {
  const { addToast } = useApp()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    addToast('Copied to Clipboard', 'Message content copied.', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendWhatsApp = () => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '')
    const encoded = encodeURIComponent(message)
    const url = `https://wa.me/${cleanMobile}?text=${encoded}`
    window.open(url, '_blank')
    addToast('Opening WhatsApp', `Sending message preview to ${customerName}...`, 'info')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={`Recipient: ${customerName} (${mobile})`} maxWidth="md">
      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {message}
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>This feature generates pre-filled WhatsApp text. Click below to open web/app or copy.</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="flex-1" leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          <Button variant="success" className="flex-1" leftIcon={<ExternalLink className="w-4 h-4" />} onClick={handleSendWhatsApp}>
            Open WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}
