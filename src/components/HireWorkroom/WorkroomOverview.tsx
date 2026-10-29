'use client'

import { AlertCircle, CalendarClock, CreditCard, FileSignature, Hourglass } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { workroomHref } from '@/components/HiredSupervisors/useHireActions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useHireBillingWeeks } from '@/lib/hooks'
import { formatEasternDateTime, formatWeekRange, toEasternISODate } from '@/lib/utils/date'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'
import type { BillingWeek, SuperviseeWeekPayment } from '@/types/sessions'

import { formatHrs, mondayOf } from './dates'

function Banner({
  tone,
  icon,
  children,
  action,
}: {
  tone: 'amber' | 'red' | 'muted'
  icon: ReactNode
  children: ReactNode
  action?: ReactNode
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : tone === 'red'
        ? 'border-destructive/30 bg-destructive/5 text-foreground'
        : 'bg-card text-foreground'
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneClass}`}
    >
      <div className="flex items-start gap-2 text-sm">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Where a hire without in-app billing stands, in one line. */
function statusLine(hire: HireListItem, supervisorName: string): string | null {
  switch (hire.status) {
    case 'PENDING':
      return `Your request was sent. ${supervisorName} hasn't responded yet.`
    case 'REVIEWED':
      return hire.completedAt
        ? 'Supervision is complete.'
        : `${supervisorName} has seen your request and hasn't responded yet.`
    case 'ACCEPTED':
    case 'ACTIVE':
      if (!hire.agreement) return `${supervisorName} accepted. Their agreement is on the way.`
      if (hire.agreement.superviseeSignedAt == null) return null // the sign banner covers it
      return hire.agreement.hourlyRateCents == null
        ? `Agreement signed. Supervision started ${formatDateOnly(hire.agreement.startDate)}; you pay ${supervisorName} directly each month.`
        : null
    case 'COMPLETED':
      return 'Supervision is complete.'
    case 'REJECTED':
      return `${supervisorName} declined this request.`
    case 'CANCELED':
      return 'This request was canceled.'
    default:
      return null
  }
}

function payment(week: BillingWeek): SuperviseeWeekPayment | null {
  return week.payment && 'totalCents' in week.payment ? week.payment : null
}

/**
 * Upwork's contract overview, adapted to weekly prepays: what this week costs
 * so far, the rate, and the hours against the weekly max — plus whatever the
 * supervisee needs to do now (sign, set up payment, review a week, pay).
 */
export function WorkroomOverview({
  hire,
  supervisorName,
  canSignAgreement,
  needsPaymentSetup,
  hasSessions,
  onSign,
  onSetUpPayment,
}: {
  hire: HireListItem
  supervisorName: string
  canSignAgreement: boolean
  needsPaymentSetup: boolean
  hasSessions: boolean
  onSign: () => void
  onSetUpPayment: () => void
}) {
  const { data, isLoading } = useHireBillingWeeks(hire.id, hasSessions)
  const timesheetHref = workroomHref(hire.id, 'timesheet')
  const weekHref = (week: BillingWeek) => `${timesheetHref}&week=${week.startDate}`

  const thisMonday = mondayOf(toEasternISODate())
  const thisWeek = data?.weeks.find((w) => w.startDate === thisMonday) ?? null
  const toReview = data?.weeks.filter((w) => w.canReview) ?? []
  const unpaid = data?.weeks.filter((w) => payment(w)?.canPayNow) ?? []
  const rateCents = data?.terms.hourlyRateCents ?? hire.agreement?.hourlyRateCents ?? 0
  const capMinutes = data?.terms.weeklyCapMinutes ?? hire.agreement?.weeklyCapMinutes ?? 0
  const thisWeekPayment = thisWeek ? payment(thisWeek) : null
  const thisWeekCostCents = Math.round((rateCents * (thisWeek?.loggedMinutes ?? 0)) / 60)
  const line = statusLine(hire, supervisorName)

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
          <span className="font-semibold">Set up payment to start supervision.</span> Billing weeks
          and sessions with {supervisorName} start once you save a card.
        </Banner>
      )}
      {toReview.map((week) => (
        <Banner
          key={week.id}
          tone="amber"
          icon={<Hourglass className="size-4 text-amber-600" aria-hidden />}
          action={
            <Link href={weekHref(week)} className={buttonVariants({ size: 'sm' })}>
              Review sessions
            </Link>
          }
        >
          <span className="font-semibold">
            {formatWeekRange(week.startDate, week.endDate)} is waiting for your review.
          </span>{' '}
          Approve or dispute by {formatEasternDateTime(week.reviewEndsAt)}, or it&apos;s approved
          automatically.
        </Banner>
      ))}
      {unpaid.map((week) => (
        <Banner
          key={week.id}
          tone="red"
          icon={<AlertCircle className="size-4 text-destructive" aria-hidden />}
          action={
            <Link href={weekHref(week)} className={buttonVariants({ size: 'sm' })}>
              Pay now
            </Link>
          }
        >
          <span className="font-semibold">
            The payment for {formatWeekRange(week.startDate, week.endDate)} didn&apos;t go through.
          </span>{' '}
          {payment(week)?.failureMessage ?? 'Pay now so sessions can keep being logged.'}
        </Banner>
      ))}

      {hasSessions && IN_APP_PAYMENTS_ENABLED ? (
        isLoading ? (
          <Skeleton className="h-36 w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 gap-6 rounded-xl border bg-card px-6 py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">This week&apos;s cost so far</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {formatUsdCents(thisWeekCostCents)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {thisWeekPayment?.paidAt
                  ? `${formatUsdCents(thisWeekPayment.totalCents)} was charged at the start of the week. You pay only for the hours you approve; anything unused goes back to your card.`
                  : thisWeekPayment
                    ? `${formatUsdCents(thisWeekPayment.totalCents)} is charged for this week. You pay only for the hours you approve.`
                    : 'Billing starts with the first week of supervision.'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hourly rate</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {formatUsdCents(rateCents)} /hr
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This week&apos;s logged</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {formatHrs(thisWeek?.loggedMinutes ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                of {formatHrs(capMinutes)} weekly max
              </p>
            </div>
            <Link href={timesheetHref} className={buttonVariants({ className: 'md:self-center' })}>
              <CalendarClock className="size-4" aria-hidden />
              View timesheet
            </Link>
          </div>
        )
      ) : (
        line && (
          <Banner tone="muted" icon={<AlertCircle className="size-4 text-muted-foreground" />}>
            {line}
          </Banner>
        )
      )}

      {hasSessions && data && data.progress.totalMinutes != null && (
        <div className="rounded-xl border bg-card px-6 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium text-foreground">Total hours</p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {formatHrs(data.progress.approvedMinutes)} approved of{' '}
              {formatHrs(data.progress.totalMinutes)}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min((data.progress.approvedMinutes / data.progress.totalMinutes) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
