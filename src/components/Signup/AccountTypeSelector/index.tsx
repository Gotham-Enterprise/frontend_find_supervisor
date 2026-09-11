'use client'

import { cn } from '@/lib/utils'

import type { SignupRole } from '../types'

const SIGNUP_ROLE_OPTIONS: { value: SignupRole; label: string }[] = [
  { value: 'supervisor', label: "I'm a Supervisor" },
  { value: 'supervisee', label: "I'm a Supervisee" },
  { value: 'medical-director', label: "I'm a Medical Director" },
  { value: 'need-medical-director', label: 'I need a Medical Director' },
]

type AccountTypeSelectorProps = {
  value: SignupRole
  onChange: (role: SignupRole) => void
}

export function AccountTypeSelector({ value, onChange }: AccountTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:grid-cols-2">
      {SIGNUP_ROLE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
            value === option.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
