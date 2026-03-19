'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type SliderProps = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * A lightweight styled range slider.
 * The invisible <input type="range"> sits on top for full native accessibility
 * (keyboard, focus, ARIA) while a purely visual track + thumb is rendered
 * underneath.
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      disabled = false,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref,
  ) => {
    const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100

    return (
      <div ref={ref} className={cn('relative flex h-5 w-full items-center', className)}>
        {/* Visual track */}
        <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-input">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Visual thumb */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute size-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-sm transition-[left]',
            disabled && 'opacity-50',
          )}
          style={{ left: `${percentage}%` }}
        />

        {/* Invisible interaction layer — provides full native a11y */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'absolute inset-0 h-full w-full cursor-pointer opacity-0',
            'disabled:cursor-not-allowed',
          )}
        />
      </div>
    )
  },
)
Slider.displayName = 'Slider'
