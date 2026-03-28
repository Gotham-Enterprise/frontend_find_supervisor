import type * as React from 'react'

/**
 * Portaled Select moves focus from the trigger into the popup on open; the trigger's blur would
 * mark RHF fields touched while the value is still empty. Use these handlers so blur runs when
 * focus truly leaves, or when the popup closes (selection or dismiss).
 */
export function selectBlurHandlers(field: { onBlur: () => void }) {
  return {
    onOpenChange: (open: boolean) => {
      if (!open) field.onBlur()
    },
    onTriggerBlur: (e: React.FocusEvent<HTMLElement>) => {
      const rt = e.relatedTarget as HTMLElement | null
      if (rt?.closest?.('[data-slot="select-content"]')) return
      field.onBlur()
    },
  }
}
