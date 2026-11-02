'use client'

import { AlertCircle, CalendarClock, Flag } from 'lucide-react'
import { useState } from 'react'

import { cardLabel } from '@/components/HirePayment/HirePaymentSetup'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CardPaymentError, useUserSnackbar } from '@/lib/hooks'
import {
  useApproveMonthlyPeriod,
  useDisputeMonthlyPeriod,
  useHireMonthlyBilling,
  usePayNowMonthlyPeriod,
} from '@/lib/hooks/useMonthlyBilling'
import { formatEasternDate, formatEasternDateTime } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly } from '@/lib/utils/profile-formatters'
import type { HireMonthlyBilling, MonthlyPeriod } from '@/types/monthly-billing'

import { MonthlyQuoteSummary } from './MonthlyQuoteSummary'

const DISPUTE_REASON_MIN = 10
const DISPUTE_REASON_MAX = 1000

type Role = HireMonthlyBilling['role']

/** Badge for a month, from the viewer's side. */
export function periodBadge(
  period: MonthlyPeriod,
  role: Role,
): { label: string; className: string } {
  const amber = 'border-amber-200 bg-amber-50 text-amber-800'
  const green = 'border-emerald-200 bg-emerald-50 text-emerald-800'
  const muted = 'border-border bg-muted text-muted-foreground'
  if (period.status === 'CANCELED') return { label: 'Canceled', className: muted }
  if (period.status === 'SETTLED')
    return { label: role === 'supervisor' ? 'Paid Out' : 'Complete', className: green }
  if (period.status === 'DISPUTED') return { label: 'On Hold · Reported', className: amber }
  if (period.status === 'APPROVED') return { label: 'Releasing', className: green }
  if (period.status === 'IN_REVIEW') return { label: 'Ended · Releasing Soon', className: green }
  if (period.paymentStatus === 'FAILED')
    return { label: 'Unpaid', className: 'border-destructive/30 bg-destructive/5 text-destructive' }
  if (period.paymentStatus === 'PENDING') return { label: 'Not Charged Yet', className: muted }
  return { label: period.isCurrent ? 'Current Month · Paid' : 'Paid', className: green }
}

/** One line on where the money is for this month. */
function moneyLine(period: MonthlyPeriod, role: Role, counterpartName: string): string | null {
  if (role === 'supervisee') {
    const total = formatUsdCents(period.totalCents ?? 0)
    if (period.status === 'SETTLED') {
      return period.refundCents
        ? `Paid ${total} · ${formatUsdCents(period.refundCents)} refunded after support's review`
        : `Paid ${total}`
    }
    if (period.status === 'DISPUTED')
      return `Paid ${total}. The payment is on hold while Gotham support reviews your report.`
    if (period.status === 'IN_REVIEW') {
      return `Paid ${total}. Released to ${counterpartName} after ${formatEasternDateTime(period.reviewEndsAt)} unless you report a problem.`
    }
    if (period.paymentStatus === 'PAID') {
      return `Paid ${total}${period.paidAt ? ` on ${formatEasternDate(period.paidAt)}` : ''}. Released to ${counterpartName} after this month ends.`
    }
    return null
  }
  const payout = formatUsdCents(period.supervisorAmountCents ?? 0)
  if (period.status === 'SETTLED') {
    return period.supervisorAmountCents
      ? `You were paid ${payout} (after the platform fee).`
      : 'Nothing was paid out for this month (support refunded it).'
  }
  if (period.status === 'DISPUTED') {
    return `${counterpartName} reported a problem. The payment is on hold until Gotham support reviews it.`
  }
  if (period.paymentStatus === 'PAID') {
    return `Paid by ${counterpartName}. You receive ${payout} after ${formatEasternDateTime(period.reviewEndsAt)}.`
  }
  if (period.paymentStatus === 'FAILED') {
    return `${counterpartName}'s payment didn't go through.`
  }
  return null
}

function PeriodRow({
  period,
  role,
  counterpartName,
  hireId,
}: {
  period: MonthlyPeriod
  role: Role
  counterpartName: string
  hireId: string
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const payNow = usePayNowMonthlyPeriod(hireId)
  const approve = useApproveMonthlyPeriod(hireId)
  const dispute = useDisputeMonthlyPeriod(hireId)
  const [disputing, setDisputing] = useState(false)
  const [reason, setReason] = useState('')
  const [approveOpen, setApproveOpen] = useState(false)
  const badge = periodBadge(period, role)
  const line = moneyLine(period, role, counterpartName)

  function handlePayNow() {
    payNow.mutate(period.id, {
      onSuccess: () => showSuccess('Payment received', { description: `${period.label} is paid.` }),
      onError: (err) =>
        showError(err instanceof CardPaymentError ? err.message : parseApiError(err)),
    })
  }

  function handleDispute() {
    dispute.mutate(
      { periodId: period.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setDisputing(false)
          showSuccess('Problem reported', {
            description: 'The payment is on hold. Gotham support will contact you both.',
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  return (
    <li className="rounded-lg border px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{period.label}</p>
        <Badge variant="outline" className={`${badge.className} hover:bg-[inherit]`}>
          {badge.label}
        </Badge>
      </div>
      {line && <p className="mt-1 text-xs text-muted-foreground">{line}</p>}

      {period.paymentStatus === 'FAILED' && period.status === 'OPEN' && (
        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">
            {role === 'supervisee'
              ? "This month's payment didn't go through"
              : 'Waiting for payment'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {role === 'supervisee' && period.failureMessage ? `${period.failureMessage} ` : ''}
            {period.graceEndsAt &&
              (role === 'supervisee'
                ? `Pay by ${formatEasternDateTime(period.graceEndsAt)}. After that, ${counterpartName} may end the supervision.`
                : `They have until ${formatEasternDateTime(period.graceEndsAt)} to pay. After that, you can end the supervision.`)}
          </p>
          {role === 'supervisee' && period.canPayNow && (
            <div className="mt-2 flex justify-end">
              <Button size="sm" disabled={payNow.isPending} onClick={handlePayNow}>
                {payNow.isPending
                  ? 'Paying…'
                  : `Pay now · ${formatUsdCents(period.totalCents ?? 0)}`}
              </Button>
            </div>
          )}
        </div>
      )}

      {(period.disputeReason || period.resolutionNote) && (
        <div className="mt-2 space-y-1 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {period.disputeReason && (
            <p>
              <span className="font-medium text-foreground">Reported problem:</span>{' '}
              {period.disputeReason}
            </p>
          )}
          {period.resolutionNote && (
            <p>
              <span className="font-medium text-foreground">Support&apos;s decision:</span>{' '}
              {period.resolutionNote}
            </p>
          )}
        </div>
      )}

      {role === 'supervisee' && (period.canApprove || period.canDispute) && !disputing && (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          {period.canDispute && (
            <Button variant="outline" size="sm" onClick={() => setDisputing(true)}>
              <Flag className="size-3.5" aria-hidden />
              Report a problem
            </Button>
          )}
          {period.canApprove && (
            <Button size="sm" onClick={() => setApproveOpen(true)}>
              Release now
            </Button>
          )}
        </div>
      )}

      {disputing && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`dispute-${period.id}`} className="text-sm font-medium text-foreground">
            What went wrong this month?
          </label>
          <Textarea
            id={`dispute-${period.id}`}
            rows={3}
            maxLength={DISPUTE_REASON_MAX}
            value={reason}
            disabled={dispute.isPending}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`E.g. ${counterpartName} was unreachable for two weeks`}
          />
          <p className="text-xs text-muted-foreground">
            The payment is held and Gotham support reviews it with you both. They decide how much is
            released to {counterpartName}; the rest goes back to your card.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={dispute.isPending}
              onClick={() => setDisputing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={dispute.isPending || reason.trim().length < DISPUTE_REASON_MIN}
              onClick={handleDispute}
            >
              {dispute.isPending ? 'Reporting…' : 'Report Problem'}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Release this month now?"
        description={`${formatUsdCents(period.amountCents)} for ${period.label} goes to ${counterpartName} now instead of after the 3-day window. You won't be able to report a problem with this month afterwards.`}
        confirmLabel="Release Now"
        isPending={approve.isPending}
        onConfirm={() =>
          approve.mutate(period.id, {
            onSuccess: () => {
              setApproveOpen(false)
              showSuccess('Month released', { description: `${counterpartName} will be paid.` })
            },
            onError: (err) => {
              setApproveOpen(false)
              showError(parseApiError(err))
            },
          })
        }
      />
    </li>
  )
}

function BillingBody({
  billing,
  hireId,
  counterpartName,
  onChangeCard,
  onEndSupervision,
}: {
  billing: HireMonthlyBilling
  hireId: string
  counterpartName: string
  onChangeCard?: () => void
  onEndSupervision?: () => void
}) {
  const { role, scheduledEnd } = billing
  const months = billing.terms.supervisionMonths

  return (
    <div className="space-y-5">
      <MonthlyQuoteSummary quote={billing.quote} perspective={role} />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Started
          </dt>
          <dd className="mt-0.5 text-foreground">{formatDateOnly(billing.terms.startDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Length
          </dt>
          <dd className="mt-0.5 text-foreground">
            {months ? `${months} month${months === 1 ? '' : 's'}` : 'Month to month'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next charge
          </dt>
          <dd className="mt-0.5 text-foreground">
            {billing.nextChargeDate ? formatDateOnly(billing.nextChargeDate) : 'None scheduled'}
          </dd>
        </div>
        {role === 'supervisee' && (
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Card
            </dt>
            <dd className="mt-0.5 text-foreground">
              <p className="truncate">{billing.card ? cardLabel(billing.card) : 'None'}</p>
              {onChangeCard && (
                <button
                  type="button"
                  onClick={onChangeCard}
                  className="mt-0.5 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
                >
                  {billing.card ? 'Change card' : 'Add a card'}
                </button>
              )}
            </dd>
          </div>
        )}
      </dl>

      {scheduledEnd && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {scheduledEnd.by === 'TERM'
              ? `The agreement ends after ${formatDateOnly(scheduledEnd.lastDay)}, when its last month runs out.`
              : `Supervision ends after ${formatDateOnly(scheduledEnd.lastDay)}, the end of the month already paid for.`}{' '}
            No more monthly payments will be charged.
          </span>
        </div>
      )}

      {billing.canEndForNonPayment && onEndSupervision && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            {counterpartName} hasn&apos;t paid in 7 days. You can end the supervision now, or keep
            waiting for their payment.
          </p>
          <Button size="sm" variant="destructive" className="shrink-0" onClick={onEndSupervision}>
            End Supervision
          </Button>
        </div>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Months</h3>
        {billing.periods.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            {billing.signed
              ? `The first month is charged on ${formatDateOnly(billing.firstChargeDate)}.`
              : 'Billing starts once the agreement is signed.'}
          </p>
        ) : (
          <ul className="space-y-2">
            {billing.periods.map((period) => (
              <PeriodRow
                key={period.id}
                period={period}
                role={role}
                counterpartName={counterpartName}
                hireId={hireId}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface MonthlyBillingPanelProps {
  hireId: string
  /** The other side: the Medical Director for a supervisee, the client for a Medical Director. */
  counterpartName: string
  /** Supervisee only: opens the card picker. */
  onChangeCard?: () => void
  /** Supervisor only: opens End Supervision (offered after 7 days unpaid). */
  onEndSupervision?: () => void
  /** False while hidden (a closed dialog), so the billing isn't fetched. */
  enabled?: boolean
}

/**
 * A monthly (Medical Director) hire's billing for either side: the terms, the
 * card, every month's payment and where its money is, plus Pay now, Release
 * now and Report a problem for the supervisee. Shown in the billing dialog and
 * on the supervisee workroom's Billing tab.
 */
export function MonthlyBillingPanel({
  hireId,
  counterpartName,
  onChangeCard,
  onEndSupervision,
  enabled = true,
}: MonthlyBillingPanelProps) {
  const { data: billing, isLoading, isError, refetch } = useHireMonthlyBilling(hireId, enabled)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }
  if (isError || !billing) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
        <p className="text-sm text-muted-foreground">We couldn&apos;t load the billing.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }
  return (
    <BillingBody
      billing={billing}
      hireId={hireId}
      counterpartName={counterpartName}
      onChangeCard={onChangeCard}
      onEndSupervision={onEndSupervision}
    />
  )
}

/** {@link MonthlyBillingPanel} in a dialog. */
export function MonthlyBillingDialog({
  hireId,
  counterpartName,
  open,
  onOpenChange,
  onChangeCard,
  onEndSupervision,
}: Omit<MonthlyBillingPanelProps, 'enabled'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,900px)] max-w-xl"
        header={
          <>
            <DialogTitle>Monthly Billing</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Your monthly supervision with {counterpartName}.
            </p>
          </>
        }
      >
        <MonthlyBillingPanel
          hireId={hireId}
          counterpartName={counterpartName}
          enabled={open}
          onChangeCard={
            onChangeCard
              ? () => {
                  onOpenChange(false)
                  onChangeCard()
                }
              : undefined
          }
          onEndSupervision={
            onEndSupervision
              ? () => {
                  onOpenChange(false)
                  onEndSupervision()
                }
              : undefined
          }
        />
      </DialogContent>
    </DialogRoot>
  )
}
