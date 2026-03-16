'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { formatUSPhoneForDisplay } from '@/lib/utils/phone'

import { Input } from './input'

export interface PhoneInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'value' | 'onChange'
> {
  value?: string
  onChange?: (value: string) => void
}

/**
 * US phone input with auto-formatting to (XXX) XXX-XXXX.
 * Works with React Hook Form. Validates via schema; normalizes to E.164 before API.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, onPaste, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatUSPhoneForDisplay(e.target.value)
      onChange?.(formatted)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(e)
      const pasted = e.clipboardData.getData('text')
      if (pasted) {
        e.preventDefault()
        const formatted = formatUSPhoneForDisplay(pasted)
        onChange?.(formatted)
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="(555) 000-0000"
        maxLength={14}
        className={cn(className)}
        {...props}
      />
    )
  },
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
