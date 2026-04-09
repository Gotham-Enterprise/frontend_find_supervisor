'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /** Optional content rendered between the description and the action buttons (e.g. a form field). */
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  isPending?: boolean
  /** When true, the confirm button is disabled (use for required fields inside children). */
  confirmDisabled?: boolean
  onConfirm: () => void
}

/**
 * Lightweight confirmation dialog backed by the existing Dialog primitives.
 * Handles its own open/close state externally via `open` + `onOpenChange`.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isPending = false,
  confirmDisabled = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogTitle>{title}</DialogTitle>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={destructive ? 'destructive' : 'default'}
            disabled={isPending || confirmDisabled}
            onClick={onConfirm}
          >
            {isPending ? 'Processing…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
