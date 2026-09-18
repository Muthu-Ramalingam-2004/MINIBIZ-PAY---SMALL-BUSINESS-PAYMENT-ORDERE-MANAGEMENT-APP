'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />,
  }

  const borderMap = {
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    error: 'border-l-4 border-l-rose-500',
    info: 'border-l-4 border-l-brand-500',
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in slide-in-from-bottom-5 duration-200',
            borderMap[toast.type]
          )}
        >
          {iconMap[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
