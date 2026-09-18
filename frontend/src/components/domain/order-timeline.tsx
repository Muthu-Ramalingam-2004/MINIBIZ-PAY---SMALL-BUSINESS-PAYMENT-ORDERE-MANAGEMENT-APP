import React from 'react'
import { OrderStatus } from '@/types'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTimelineProps {
  currentStatus: OrderStatus
  onStatusChange?: (status: OrderStatus) => void
}

const STAGES: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Completed']

export function OrderTimeline({ currentStatus, onStatusChange }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'Cancelled'
  const currentIndex = STAGES.indexOf(currentStatus)

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Progress Timeline</h4>
        {isCancelled && (
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Order Cancelled
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-between w-full">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
        {!isCancelled && currentIndex > 0 && (
          <div
            className="absolute top-4 left-4 h-0.5 bg-brand-600 z-0 transition-all duration-300"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 92}%` }}
          />
        )}

        {STAGES.map((stage, idx) => {
          const isPassed = !isCancelled && idx <= currentIndex
          const isCurrent = !isCancelled && idx === currentIndex

          return (
            <div
              key={stage}
              onClick={() => onStatusChange && onStatusChange(stage)}
              className={cn(
                'relative z-10 flex flex-col items-center group cursor-pointer',
                isCancelled && 'opacity-50 pointer-events-none'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  isCurrent
                    ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950 scale-110'
                    : isPassed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-slate-400'
                )}
              >
                {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium mt-2 text-center transition-colors',
                  isCurrent ? 'text-brand-600 dark:text-brand-400 font-bold' : isPassed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {stage}
              </span>
            </div>
          )
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>This order was cancelled. No further status changes allowed.</span>
        </div>
      )}
    </div>
  )
}
