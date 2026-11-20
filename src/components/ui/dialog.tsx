'use client'

import {
  Dialog as DialogPrimitive,
  type DialogBackdropProps,
  type DialogCloseProps,
  type DialogPopupProps,
  type DialogTitleProps,
} from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const DialogRoot = DialogPrimitive.Root

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:animate-in data-[open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  bodyClassName,
  header,
  showCloseButton = true,
  children,
  ...props
}: DialogPopupProps & {
  showCloseButton?: boolean
  /** Classes for the scrolling body (e.g. `p-0` to manage padding yourself). */
  bodyClassName?: string
  /**
   * Fixed header above the scrolling body (title, subtitle, actions); the close
   * button sits inline with it. Without it, the close button floats top-right.
   */
  header?: React.ReactNode
}) {
  const closeButton = showCloseButton && (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn(
        'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        header ? '-mr-1.5 -mt-1 shrink-0' : 'absolute right-4 top-4 z-10',
      )}
    >
      <X className="size-4" />
    </DialogPrimitive.Close>
  )
  return (
    <DialogPortal>
      {/* forceRender: Base UI skips nested-dialog backdrops by default, leaving the
          parent dialog undimmed when dialogs stack (e.g. photo editor over profile edit) */}
      <DialogBackdrop forceRender />
      <DialogPrimitive.Viewport
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
        )}
      >
        {/* The popup itself never scrolls: it clips to its rounded corners and the
            body inside scrolls, so the scrollbar stays within the dialog's shape. */}
        <DialogPrimitive.Popup
          className={cn(
            'relative my-auto flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg',
            className,
          )}
          {...props}
        >
          {header ? (
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="min-w-0 flex-1">{header}</div>
              {closeButton}
            </div>
          ) : (
            closeButton
          )}
          <div
            className={cn(
              'scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-6',
              bodyClassName,
            )}
          >
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  )
}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function DialogClose({ className, ...props }: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      className={cn(
        'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

export { DialogBackdrop, DialogClose, DialogContent, DialogRoot, DialogTitle }
