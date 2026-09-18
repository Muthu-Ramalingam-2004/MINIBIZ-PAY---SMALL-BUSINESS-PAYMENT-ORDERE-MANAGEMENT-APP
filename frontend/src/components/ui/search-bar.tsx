import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from './input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  return (
    <div className={`relative w-full max-w-xs ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        rightIcon={
          value ? (
            <button onClick={() => onChange('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : undefined
        }
      />
    </div>
  )
}
