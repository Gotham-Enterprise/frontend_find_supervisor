'use client'

import { AlertCircle, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayoutRemovalCheck, useRemovePayoutAccount, useUserSnackbar } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import type { PayoutRemovalBlocker } from '@/types/payouts'

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function blockerText(blocker: PayoutRemovalBlocker): string {
  switch (blocker.code) {
    case 'active_hourly_hires':
      return `${plural(blocker.count, 'supervision is', 'supervisions are')} billed weekly through this account. Complete or end ${blocker.count === 1 ? 'it' : 'them'} first.`
    case 'unsettled_weeks':
      return `${plural(blocker.count, 'week', 'weeks')} of supervisee payments ${blocker.count === 1 ? "hasn't" : "haven't"} been paid out to you yet.`
    case 'unpaid_late_sessions':
      return `${plural(blocker.count, 'late session payment', 'late session payments')} ${blocker.count === 1 ? "hasn't" : "haven't"} been paid out to you yet.`
    case 'stripe_balance':
      return `${formatUsdCents(blocker.amountCents)} is still in your Stripe balance. Wait for it to reach your bank.`
  }
}

/** A child of DialogContent, so the check re-runs each time the dialog opens. */
function RemoveBody({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { data, isLoading, isError, refetch } = usePayoutRemovalCheck(true)
  const removeMutation = useRemovePayoutAccount()
  const { showSuccess, showError } = useUserSnackbar()

  async function handleRemove() {
    try {
      await removeMutation.mutateAsync()
    } catch (error) {
      showError(parseApiError(error))
      void refetch()
      return
    }
    showSuccess('Payout account removed', {
      description: 'You can set up payouts again anytime.',
    })
    onOpenChange(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-9 w-40" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">We couldn&apos;t check your payout account.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!data.canRemove) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-4 shrink-0 text-amber-600" aria-hidden />
            Your payout account is still in use
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {data.blockers.map((blocker) => (
              <li key={blocker.code}>{blockerText(blocker)}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
        <p className="flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          This can&apos;t be undone
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Your Stripe payout account and the bank details on it are deleted.</li>
          <li>You can&apos;t send hourly agreements until you set up payouts again.</li>
          <li>Your earnings history in Find a Supervisor stays.</li>
        </ul>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={removeMutation.isPending}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          disabled={removeMutation.isPending}
          onClick={() => void handleRemove()}
        >
          {removeMutation.isPending ? 'Removing…' : 'Remove Payout Account'}
        </Button>
      </div>
    </div>
  )
}

export function RemovePayoutAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" header={<DialogTitle>Remove Payout Account</DialogTitle>}>
        <RemoveBody onOpenChange={onOpenChange} />
      </DialogContent>
    </DialogRoot>
  )
}
