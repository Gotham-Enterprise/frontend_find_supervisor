import { Input as InputPrimitive } from '@base-ui/react/input'
import * as React from 'react'

import { cn } from '@/lib/utils'

const INPUT_BASE_CLASSES =
  'h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const ADORNMENT_CLASSES = 'flex shrink-0 items-center text-sm text-muted-foreground'

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'className'> {
  className?: string
  /** Content rendered at the start of the input (e.g. "$", search icon) */
  startAdornment?: React.ReactNode
  /** Content rendered at the end of the input (e.g. "USD", "%") */
  endAdornment?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, startAdornment, endAdornment, type, ...props }, ref) => {
    const hasAdornments = startAdornment != null || endAdornment != null

    if (!hasAdornments) {
      return (
        <InputPrimitive
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(INPUT_BASE_CLASSES, className)}
          {...props}
        />
      )
    }

    return (
      <div
        className={cn(
          'flex w-full items-center overflow-hidden rounded-lg border border-input bg-card transition-colors',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          'has-[[data-slot=input]:disabled]:cursor-not-allowed has-[[data-slot=input]:disabled]:bg-input/50 has-[[data-slot=input]:disabled]:opacity-50',
          'has-[[data-slot=input][aria-invalid=true]]:border-destructive has-[[data-slot=input][aria-invalid=true]]:ring-3 has-[[data-slot=input][aria-invalid=true]]:ring-destructive/20',
          'dark:bg-input/30 dark:has-[[data-slot=input]:disabled]:bg-input/80 dark:has-[[data-slot=input][aria-invalid=true]]:border-destructive/50 dark:has-[[data-slot=input][aria-invalid=true]]:ring-destructive/40',
          className,
        )}
      >
        {startAdornment != null && (
          <span className={cn(ADORNMENT_CLASSES, 'pl-3 pr-1')}>{startAdornment}</span>
        )}
        <InputPrimitive
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            'h-10 min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none',
            'placeholder:text-muted-foreground',
            'disabled:pointer-events-none',
            'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            startAdornment != null ? 'pl-0' : 'pl-3',
            endAdornment != null ? 'pr-0' : 'pr-3',
          )}
          {...props}
        />
        {endAdornment != null && (
          <span className={cn(ADORNMENT_CLASSES, 'pl-1 pr-3')}>{endAdornment}</span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
