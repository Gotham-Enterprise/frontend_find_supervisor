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
  showCloseButton = true,
  children,
  ...props
}: DialogPopupProps & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Viewport
        className={cn(
          'fixed left-[50%] top-[50%] z-50 flex max-h-[85vh] w-full translate-x-[-50%] translate-y-[-50%] justify-center p-4 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
        )}
      >
        <DialogPrimitive.Popup
          className={cn(
            'relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg',
            className,
          )}
          {...props}
        >
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          )}
          {children}
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
