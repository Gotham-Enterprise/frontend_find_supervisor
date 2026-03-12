'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { SupervisionFormat } from '../types'

type FormatOption = {
  value: SupervisionFormat
  label: string
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'virtual', label: 'Virtual' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
]

type FormatSelectorProps = {
  value: SupervisionFormat
  onChange: (value: SupervisionFormat) => void
  className?: string
}

export function FormatSelector({ value, onChange, className }: FormatSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {FORMAT_OPTIONS.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {isActive && <Check className="size-3.5 stroke-[2.5]" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
