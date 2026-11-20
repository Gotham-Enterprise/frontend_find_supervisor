'use client'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'

import { ActivityLogPanel } from './ActivityLogPanel'

/** {@link ActivityLogPanel} in a dialog, for the Medical Director's client list. */
export function ActivityLogDialog({
  hireId,
  clientName,
  open,
  onOpenChange,
}: {
  hireId: string
  clientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,900px)] max-w-xl"
        header={
          <>
            <DialogTitle>Activity Log</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Your work for {clientName}, by month.
            </p>
          </>
        }
      >
        <ActivityLogPanel hireId={hireId} counterpartName={clientName} enabled={open} />
      </DialogContent>
    </DialogRoot>
  )
}
