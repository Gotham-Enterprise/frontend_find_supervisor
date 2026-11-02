'use client'

import {
  AlertCircle,
  CalendarClock,
  CreditCard,
  FileSignature,
  Hourglass,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'

import { periodBadge } from '@/components/MonthlyBilling/MonthlyBillingDialog'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useHireMonthlyBilling } from '@/lib/hooks/useMonthlyBilling'
import { formatEasternDate, formatEasternDateTime } from '@/lib/utils/date'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'
import type { HireMonthlyBilling } from '@/types/monthly-billing'

import { Banner } from './WorkroomOverview'

/** Where a monthly hire that isn't running stands, in one line. */
function endedLine(hire: HireListItem): string | null {
  if (hire.status === 'COMPLETED') return 'Supervision is complete.'
  if (hire.status === 'CANCELED') return 'This supervision has ended.'
  return null
}

/** "Month 2 of 6" for an agreement with a fixed number of months. */
function TermProgress({ billing }: { billing: HireMonthlyBilling }) {
  const months = billing.terms.supervisionMonths
  if (!months) return null
  const current = billing.periods.find((p) => p.isCurrent)
  const reached = current
    ? current.periodIndex + 1
    : billing.periods.filter((p) => p.status !== 'CANCELED').length
  const month = Math.min(Math.max(reached, 0), months)
  if (month === 0) return null
  const left = months - month
  return (
    <div className="rounded-xl border bg-card px-6 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-foreground">
          Month {month} of {months}
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {left === 0 ? 'Last month' : `${left} month${left === 1 ? '' : 's'} left`}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(month / months) * 100}%` }}
        />
      </div>
    </div>
  )
}

/**
 * The workroom overview for an in-app monthly (Medical Director) hire: what
 * the supervisee needs to do now (sign, set up payment, pay an unpaid month,
 * check a month before its payment is released), then this month at a glance
 * and how far into the term they are. The months themselves are on the
 * Billing tab.
 */
export function WorkroomMonthlyOverview({
  hire,
  supervisorName,
  billingHref,
  canSignAgreement,
  needsPaymentSetup,
  onSign,
  onSetUpPayment,
}: {
  hire: HireListItem
  supervisorName: string
  billingHref: string
  canSignAgreement: boolean
  needsPaymentSetup: boolean
  onSign: () => void
  onSetUpPayment: () => void
}) {
  const signed = hire.agreement?.superviseeSignedAt != null
  const { data: billing, isLoading } = useHireMonthlyBilling(hire.id, signed)

  const unpaid = billing?.unpaid
    ? (billing.periods.find((p) => p.id === billing.unpaid?.periodId) ?? null)
    : null
  const toCheck = billing?.periods.filter((p) => p.status === 'IN_REVIEW' && p.canDispute) ?? []
  const current = billing?.periods.find((p) => p.isCurrent) ?? null
  const currentBadge = current ? periodBadge(current, 'supervisee') : null
  const ended = endedLine(hire)

  return (
    <div className="space-y-4">
      {canSignAgreement && (
        <Banner
          tone="amber"
          icon={<FileSignature className="size-4 text-amber-600" aria-hidden />}
          action={
            <Button size="sm" onClick={onSign}>
              Review &amp; Sign
            </Button>
          }
        >
          <span className="font-semibold">{supervisorName} sent you an agreement to sign.</span>{' '}
          {needsPaymentSetup
            ? 'Set up your payment card, then sign to start supervision.'
            : "Supervision doesn't begin until you sign."}
        </Banner>
      )}
      {!canSignAgreement && needsPaymentSetup && (
        <Banner
          tone="amber"
          icon={<CreditCard className="size-4 text-amber-600" aria-hidden />}
          action={
            <Button size="sm" onClick={onSetUpPayment}>
              Set up payment
            </Button>
          }
        >
          <span className="font-semibold">Set up payment to start supervision.</span> Monthly
          payments to {supervisorName} start once you save a card.
        </Banner>
      )}
      {unpaid && (
        <Banner
          tone="red"
          icon={<AlertCircle className="size-4 text-destructive" aria-hidden />}
          action={
            <Link href={billingHref} className={buttonVariants({ size: 'sm' })}>
              Pay now
            </Link>
          }
        >
          <span className="font-semibold">
            The payment for {unpaid.label} didn&apos;t go through.
          </span>{' '}
          {unpaid.failureMessage ? `${unpaid.failureMessage} ` : ''}
          {unpaid.graceEndsAt &&
            `Pay by ${formatEasternDateTime(unpaid.graceEndsAt)}. After that, ${supervisorName} may end the supervision.`}
        </Banner>
      )}
      {toCheck.map((period) => (
        <Banner
          key={period.id}
          tone="amber"
          icon={<Hourglass className="size-4 text-amber-600" aria-hidden />}
          action={
            <Link href={billingHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Review month
            </Link>
          }
        >
          <span className="font-semibold">{period.label} has ended.</span> Its payment is released
          to {supervisorName} after {formatEasternDateTime(period.reviewEndsAt)}, unless you report
          a problem.
        </Banner>
      ))}
      {billing?.scheduledEnd && !ended && (
        <Banner tone="amber" icon={<CalendarClock className="size-4 text-amber-600" aria-hidden />}>
          {billing.scheduledEnd.by === 'TERM'
            ? `The agreement ends after ${formatDateOnly(billing.scheduledEnd.lastDay)}, when its last month runs out.`
            : `Supervision ends after ${formatDateOnly(billing.scheduledEnd.lastDay)}, the end of the month already paid for.`}{' '}
          No more monthly payments will be charged.
        </Banner>
      )}

      {signed && isLoading ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : billing ? (
        <>
          <div className="grid grid-cols-1 gap-6 rounded-xl border bg-card px-6 py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Charged each month</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {formatUsdCents(billing.quote.monthlyTotalCents)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatUsdCents(billing.quote.monthlyAmountCents)} for {supervisorName} plus a{' '}
                {formatUsdCents(billing.quote.serviceFeeCents)} service fee. Each month&apos;s
                payment is held and released to them 3 days after the month ends.
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">This month</p>
              {current && currentBadge ? (
                <>
                  <Badge
                    variant="outline"
                    className={`mt-1.5 ${currentBadge.className} hover:bg-[inherit]`}
                  >
                    {currentBadge.label}
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {current.label}
                    {current.paymentStatus === 'PAID' && current.paidAt
                      ? ` · paid ${formatEasternDate(current.paidAt)}`
                      : ''}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {billing.periods.length === 0 && !ended
                    ? `Starts ${formatDateOnly(billing.firstChargeDate)}`
                    : 'No current month'}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next charge</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {billing.nextChargeDate ? formatDateOnly(billing.nextChargeDate) : 'None'}
              </p>
              {!billing.nextChargeDate && (
                <p className="mt-1 text-sm text-muted-foreground">No more charges scheduled</p>
              )}
            </div>
            <Link href={billingHref} className={buttonVariants({ className: 'md:self-center' })}>
              <Receipt className="size-4" aria-hidden />
              View billing
            </Link>
          </div>
          <TermProgress billing={billing} />
        </>
      ) : null}

      {ended && (
        <Banner tone="muted" icon={<AlertCircle className="size-4 text-muted-foreground" />}>
          {ended}
        </Banner>
      )}
      {!signed && !canSignAgreement && !ended && (
        <Banner tone="muted" icon={<AlertCircle className="size-4 text-muted-foreground" />}>
          {supervisorName} is preparing the agreement.
        </Banner>
      )}
    </div>
  )
}
