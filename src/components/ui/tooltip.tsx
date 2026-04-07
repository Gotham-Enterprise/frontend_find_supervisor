'use client'

import { Tooltip } from '@base-ui/react/tooltip'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Wraps a control that is disabled so hover/focus still shows a hint (native disabled buttons do not receive pointer events).
 */
export function DisabledWithTooltip({
  tooltip,
  disabled,
  children,
}: {
  tooltip: string
  disabled: boolean
  children: React.ReactElement
}) {
  if (!disabled) {
    return children
  }

  return (
    <Tooltip.Provider delay={250}>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={(props) => (
            <span
              {...props}
              className={cn('inline-flex cursor-default', props.className)}
              aria-label={tooltip}
            >
              {children}
            </span>
          )}
        />
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={6}>
            <Tooltip.Popup
              className={cn(
                'z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md',
              )}
            >
              {tooltip}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
