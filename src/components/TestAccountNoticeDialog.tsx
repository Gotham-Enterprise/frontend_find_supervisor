'use client'

import { FlaskConical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'

interface TestAccountNoticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Shown when a signed-in test account tries to hire or connect with a live
 * account. The backend would reject it anyway; this explains why up front.
 */
export function TestAccountNoticeDialog({ open, onOpenChange }: TestAccountNoticeDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <FlaskConical className="size-5" aria-hidden="true" />
        </div>
        <DialogTitle>You&apos;re using a test account</DialogTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Test accounts can browse live profiles, but they can&apos;t hire, connect with, or message
          live users. This keeps real Supervisors and Supervisees from receiving test requests.
          Nothing was sent.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          To try this flow, use it with one of your other test accounts.
        </p>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
