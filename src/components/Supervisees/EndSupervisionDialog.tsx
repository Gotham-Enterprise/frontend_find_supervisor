'use client'

import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { EndSupervisionOutcome } from '@/lib/api/supervision'
import { useEndSupervision, useUserSnackbar } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatDisplayName } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

const REASON_MAX = 500

function OutcomeChoice({
  checked,
  disabled,
  onSelect,
  title,
  description,
}: {
  checked: boolean
  disabled: boolean
  onSelect: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border hover:bg-muted',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p
          className={cn(
            'mt-0.5 text-xs leading-relaxed',
            checked ? 'text-primary-foreground/85' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      </div>
      {checked && <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />}
    </button>
  )
}

/** A child of DialogContent, so the choice and note reset each time the dialog opens. */
function EndSupervisionBody({
  hire,
  onOpenChange,
}: {
  hire: HireListItem
  onOpenChange: (open: boolean) => void
}) {
  const [outcome, setOutcome] = useState<EndSupervisionOutcome | null>(null)
  const [reason, setReason] = useState('')
  const endMutation = useEndSupervision()
  const { showSuccess, showError } = useUserSnackbar()
  const superviseeName = formatDisplayName(hire.supervisee)
  const billedInApp = hire.agreement?.hourlyRateCents != null
  const isPending = endMutation.isPending

  // mutateAsync, not mutate(…, { onSuccess }): the hire leaves the current
  // filter on refetch and this dialog's card unmounts with it.
  async function handleEnd() {
    if (!outcome) return
    try {
      await endMutation.mutateAsync({
        hireId: hire.id,
        outcome,
        reason: reason.trim() || undefined,
      })
    } catch (error) {
      showError(parseApiError(error))
      return
    }
    showSuccess(outcome === 'completed' ? 'Supervision completed' : 'Supervision ended', {
      description: `${superviseeName} has been notified.`,
    })
    onOpenChange(false)
  }

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="How the supervision ended" className="space-y-2">
        <OutcomeChoice
          checked={outcome === 'completed'}
          disabled={isPending}
          onSelect={() => setOutcome('completed')}
          title="Supervision Is Complete"
          description={`It ran its course. It moves to Completed, and ${superviseeName} can leave you a review.`}
        />
        <OutcomeChoice
          checked={outcome === 'ended_early'}
          disabled={isPending}
          onSelect={() => setOutcome('ended_early')}
          title="Ending Early"
          description="It's stopping before it was meant to. It moves to Closed."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="end-supervision-reason" className="text-sm font-medium text-foreground">
          Note to {superviseeName} <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="end-supervision-reason"
          value={reason}
          maxLength={REASON_MAX}
          rows={3}
          disabled={isPending}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Included in the notification and email they receive"
        />
      </div>

      {billedInApp && (
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          No new weekly payments are charged after this. If this week&apos;s prepay was already
          paid, you can still log this week&apos;s sessions until Monday 11:59 PM (US Eastern), and
          you&apos;re paid for the hours {superviseeName} approves.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          disabled={!outcome || isPending}
          onClick={() => void handleEnd()}
        >
          {isPending ? 'Ending…' : 'End Supervision'}
        </Button>
      </div>
    </div>
  )
}

export function EndSupervisionDialog({
  hire,
  open,
  onOpenChange,
}: {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        header={
          <>
            <DialogTitle>End Supervision</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              End your supervision with {formatDisplayName(hire.supervisee)}. This can&apos;t be
              undone.
            </p>
          </>
        }
      >
        <EndSupervisionBody hire={hire} onOpenChange={onOpenChange} />
      </DialogContent>
    </DialogRoot>
  )
}
