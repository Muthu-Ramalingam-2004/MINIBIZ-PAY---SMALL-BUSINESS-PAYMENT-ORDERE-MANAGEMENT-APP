import React from 'react'
import { Filter } from 'lucide-react'
import { Select } from './select'

export interface FilterOption {
  key: string
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}

interface FilterBarProps {
  filters: FilterOption[]
  onClearAll?: () => void
}

export function FilterBar({ filters, onClearAll }: FilterBarProps) {
  const hasActiveFilter = filters.some((f) => f.value !== '' && f.value !== 'all')

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>Filters:</span>
      </div>
      {filters.map((filter) => (
        <div key={filter.key} className="w-36 sm:w-44">
          <Select
            value={filter.value}
            options={filter.options}
            onChange={(e) => filter.onChange(e.target.value)}
          />
        </div>
      ))}
      {hasActiveFilter && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-rose-600 underline font-medium ml-1 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  )
}
