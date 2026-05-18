import * as React from 'react'

import { cn } from '@/lib/utils'

/** Inline defaults so long tokens and flex ancestors cannot suppress wrapping (also for raw `<textarea>`). */
export const textareaWrapStyle: React.CSSProperties = {
  maxWidth: '100%',
  minWidth: 0,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  // Prefer classic sizing: `field-sizing: content` grows inline until a max is found; when that
  // max is indefinite (e.g. some flex chains), wrapping never kicks in and text paints past edges.
  fieldSizing: 'fixed',
}

function Textarea({ className, style, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      style={{ ...textareaWrapStyle, ...style }}
      className={cn(
        'block min-h-16 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
