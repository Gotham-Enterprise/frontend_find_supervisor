'use client'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { formatDisplayName } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

import { HirePaymentSetup } from './HirePaymentSetup'

/**
 * The supervisee's payment step on its own, so the card form is in view right
 * away (the agreement dialog keeps the terms and full breakdown). Opened from
 * "Set up payment" / "Change card", and right after signing an hourly agreement.
 */
export function HirePaymentDialog({
  hire,
  open,
  onOpenChange,
  changeCard = false,
}: {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Open on the card picker even when a card is already saved. */
  changeCard?: boolean
}) {
  const supervisorName = formatDisplayName(hire.supervisor)

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,760px)] max-w-lg overflow-y-auto">
        <DialogTitle>{changeCard ? 'Change payment card' : 'Set up weekly payment'}</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Save the card for your weekly prepays with {supervisorName}. Nothing is charged when you
          save it.
        </p>
        {/* A child of DialogContent, so its picker state resets whenever the dialog closes. */}
        <HirePaymentSetup
          hireId={hire.id}
          supervisorName={supervisorName}
          startChangingCard={changeCard}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </DialogRoot>
  )
}
