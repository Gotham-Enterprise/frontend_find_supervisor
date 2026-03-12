'use client'

import { cn } from '@/lib/utils'

import type { SignupRole } from '../types'

type AccountTypeSelectorProps = {
  value: SignupRole
  onChange: (role: SignupRole) => void
}

export function AccountTypeSelector({ value, onChange }: AccountTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 rounded-xl border border-border bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => onChange('supervisor')}
        className={cn(
          'rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
          value === 'supervisor'
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        I&apos;m a Supervisor
      </button>
      <button
        type="button"
        onClick={() => onChange('supervisee')}
        className={cn(
          'rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
          value === 'supervisee'
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        I&apos;m a Supervisee
      </button>
    </div>
  )
}
