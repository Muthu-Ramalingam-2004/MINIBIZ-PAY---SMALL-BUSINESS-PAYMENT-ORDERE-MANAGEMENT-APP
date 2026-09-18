'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'left' | 'right'
}

export function Drawer({ isOpen, onClose, title, children, position = 'left' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl border-slate-200 dark:border-slate-800 transition-transform transform duration-300 ease-in-out z-10 w-72 sm:w-80',
          position === 'left' ? 'left-0 border-r' : 'right-0 border-l'
        )}
      >
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
