'use client'

import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

type CheckboxProps = Omit<React.ComponentProps<'button'>, 'onChange'> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      data-slot="checkbox"
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-primary bg-primary text-white' : 'border-[#d1d5db] bg-white',
        className,
      )}
      {...props}
    >
      {checked && <CheckIcon className="size-3 stroke-[3]" />}
    </button>
  )
}

export { Checkbox }
