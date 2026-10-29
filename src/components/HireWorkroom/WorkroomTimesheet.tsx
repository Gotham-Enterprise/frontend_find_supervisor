'use client'

import { AlertCircle, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import { useHireSessions } from '@/components/HireSessions/HireSessionsDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  formatCalendarDate,
  formatEasternDateTime,
  formatWeekRange,
  toEasternISODate,
} from '@/lib/utils/date'
import { formatUsdCents } from '@/lib/utils/money'
import type { BillingWeek } from '@/types/sessions'

import {
  addDays,
  addMonths,
  formatDayRow,
  formatHrs,
  formatMonth,
  mondayOf,
  monthGrid,
  monthOf,
} from './dates'

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

type DayMark = 'logged' | 'late' | 'disputed'

interface DayInfo {
  minutes: number
  mark: DayMark
}

/** Minutes per calendar day across all weeks; rejected late entries don't count. */
function dayTotals(weeks: BillingWeek[]): Map<string, DayInfo> {
  const days = new Map<string, DayInfo>()
  for (const week of weeks) {
    for (const session of week.sessions) {
      if (session.approvalStatus === 'REJECTED') continue
      const prev = days.get(session.sessionDate)
      const mark: DayMark =
        week.status === 'DISPUTED'
          ? 'disputed'
          : session.source === 'SUPPORT' || prev?.mark === 'late'
            ? 'late'
            : 'logged'
      days.set(session.sessionDate, {
        minutes: (prev?.minutes ?? 0) + session.durationMinutes,
        mark,
      })
    }
  }
  return days
}

function DayMarker({ mark }: { mark: DayMark }) {
  if (mark === 'late') {
    return (
      <svg viewBox="0 0 6 5" aria-hidden className="size-1.5 fill-amber-500">
        <path d="M3 0 6 5H0z" />
      </svg>
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'size-1.5',
        mark === 'disputed' ? 'rounded-[1px] bg-destructive' : 'rounded-full bg-primary',
      )}
    />
  )
}

function StatTile({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  )
}

/** "Last week" status line: what the supervisee needs to know (or do) about it. */
function lastWeekNote(week: BillingWeek): string {
  switch (week.status) {
    case 'OPEN':
      return `Logging until ${formatEasternDateTime(week.logDeadlineAt)}`
    case 'IN_REVIEW':
      return `Review by ${formatEasternDateTime(week.reviewEndsAt)}`
    case 'DISPUTED':
      return 'Disputed · with Gotham support'
    default:
      return 'Approved'
  }
}

/**
 * Upwork-style timesheet for one hourly hire: hours at a glance, a month
 * calendar marking the days with sessions, the selected week's hours per day,
 * and below it that week's full card (sessions, payment, approve/dispute).
 * The selected week lives in `?week=YYYY-MM-DD` so it can be linked to.
 */
export function WorkroomTimesheet({
  hireId,
  supervisorName,
  onChangeCard,
  onSetUpPayment,
}: {
  hireId: string
  supervisorName: string
  onChangeCard: () => void
  onSetUpPayment: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const weekParam = useSearchParams().get('week')
  const [shownMonth, setShownMonth] = useState<string | null>(null)
  const { data, isLoading, isError, refetch, renderWeekCard, dialogs, approveWeek, disputeWeek } =
    useHireSessions({
      hireId,
      counterpartName: supervisorName,
      enabled: true,
      onChangeCard,
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="size-4" aria-hidden />
          We couldn&apos;t load the timesheet.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const today = toEasternISODate()
  const thisMonday = mondayOf(today)
  const weeksByMonday = new Map(data.weeks.map((w) => [w.startDate, w]))
  const days = dayTotals(data.weeks)
  const cap = data.terms.weeklyCapMinutes

  // Selected week: the linked one, else this week, else the latest billed week.
  const selectedMonday =
    weekParam && ISO_DATE.test(weekParam)
      ? mondayOf(weekParam)
      : weeksByMonday.has(thisMonday) || data.weeks.length === 0
        ? thisMonday
        : data.weeks[0].startDate
  const selectedWeek = weeksByMonday.get(selectedMonday) ?? null
  const month = shownMonth ?? monthOf(selectedMonday)

  const thisWeek = weeksByMonday.get(thisMonday) ?? null
  const lastWeek = weeksByMonday.get(addDays(thisMonday, -7)) ?? null
  const lastSessionDate = [...days.keys()].sort().at(-1) ?? null
  const totals = 'netPaidCents' in data.totals ? data.totals : null

  function selectWeek(date: string, { scrollToDetails = false } = {}) {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', 'timesheet')
    params.set('week', mondayOf(date))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    if (monthOf(date) !== month) setShownMonth(monthOf(date))
    if (scrollToDetails) {
      requestAnimationFrame(() =>
        document.getElementById('week-details')?.scrollIntoView({ behavior: 'smooth' }),
      )
    }
  }

  return (
    <div className="space-y-6">
      {data.hasPaymentCard === false && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <CreditCard className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              <span className="font-semibold">Set up payment to start supervision.</span> Billing
              weeks and session logging with {supervisorName} start once you save a card.
            </span>
          </p>
          <Button size="sm" className="shrink-0" onClick={onSetUpPayment}>
            Set up payment
          </Button>
        </div>
      )}

      {/* ── Hours at a glance ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 rounded-xl border bg-card px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Last session"
          value={lastSessionDate ? formatHrs(days.get(lastSessionDate)?.minutes ?? 0) : '—'}
        >
          {lastSessionDate ? formatCalendarDate(lastSessionDate) : 'No sessions yet'}
        </StatTile>
        <StatTile label="This week" value={formatHrs(thisWeek?.loggedMinutes ?? 0)}>
          of {formatHrs(cap)} weekly max
        </StatTile>
        <StatTile label="Last week" value={lastWeek ? formatHrs(lastWeek.loggedMinutes) : '—'}>
          {lastWeek ? (
            lastWeek.canReview ? (
              // Like Upwork's "Dispute" under Last week: act on it right here.
              <>
                <span className="block">
                  Review by {formatEasternDateTime(lastWeek.reviewEndsAt)}
                </span>
                <span className="mt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => approveWeek(lastWeek)}
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => disputeWeek(lastWeek)}
                    className="font-medium text-destructive underline underline-offset-4 hover:text-destructive/80"
                  >
                    Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => selectWeek(lastWeek.startDate, { scrollToDetails: true })}
                    className="text-muted-foreground underline-offset-4 hover:underline"
                  >
                    View sessions
                  </button>
                </span>
              </>
            ) : (
              lastWeekNote(lastWeek)
            )
          ) : (
            'No billing week'
          )}
        </StatTile>
        <StatTile label="Since start" value={formatHrs(data.progress.loggedMinutes)}>
          {data.progress.totalMinutes != null
            ? `${formatHrs(data.progress.approvedMinutes)} approved of ${formatHrs(data.progress.totalMinutes)}`
            : `${formatHrs(data.progress.approvedMinutes)} approved`}
          {totals && totals.chargedCents > 0 && (
            <span className="block">Paid so far: {formatUsdCents(totals.netPaidCents)}</span>
          )}
        </StatTile>
      </div>

      {/* ── Work diary + week details, on one white panel ────────────── */}
      <div className="space-y-8 rounded-xl border bg-card p-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Work Diary</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            {/* Month calendar */}
            <div className="self-start rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Previous month"
                  onClick={() => setShownMonth(addMonths(month, -1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <p className="text-sm font-semibold text-foreground">{formatMonth(month)}</p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Next month"
                  onClick={() => setShownMonth(addMonths(month, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
                {WEEKDAY_HEADERS.map((d) => (
                  <span key={d} className="pb-2 font-medium">
                    {d}
                  </span>
                ))}
              </div>
              <div className="space-y-1">
                {monthGrid(month).map((week) => {
                  const isSelected = week[0] === selectedMonday
                  return (
                    <div
                      key={week[0]}
                      className={cn('grid grid-cols-7 rounded-full', isSelected && 'bg-muted')}
                    >
                      {week.map((date, i) => {
                        const info = days.get(date)
                        const inMonth = monthOf(date) === month
                        const isEdge = isSelected && (i === 0 || i === 6)
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => selectWeek(date)}
                            aria-label={`${formatCalendarDate(date)}${info ? `, ${formatHrs(info.minutes)}` : ''}`}
                            className={cn(
                              'flex h-10 flex-col items-center justify-center gap-0.5 rounded-full text-sm tabular-nums transition-colors',
                              isEdge
                                ? 'bg-foreground font-semibold text-background'
                                : 'hover:bg-muted-foreground/10',
                              !inMonth && !isEdge && 'text-muted-foreground/60',
                              date === today && !isEdge && 'font-semibold text-primary',
                            )}
                          >
                            {Number(date.slice(8, 10))}
                            <span className="flex h-1.5 items-center">
                              {info && <DayMarker mark={info.mark} />}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <DayMarker mark="logged" /> Logged
                </span>
                <span className="flex items-center gap-1.5">
                  <DayMarker mark="late" /> Late entry
                </span>
                <span className="flex items-center gap-1.5">
                  <DayMarker mark="disputed" /> Disputed
                </span>
              </div>
            </div>

            {/* Selected week, hours per day */}
            <div className="min-w-0">
              <p className="mb-2 text-base font-semibold text-foreground">
                {formatWeekRange(selectedMonday, addDays(selectedMonday, 6))}
              </p>
              <ul className="divide-y border-y">
                {Array.from({ length: 7 }, (_, i) => addDays(selectedMonday, i)).map((date) => {
                  const minutes = days.get(date)?.minutes ?? 0
                  const pct = cap > 0 ? Math.min((minutes / cap) * 100, 100) : 0
                  return (
                    <li key={date} className="flex items-center gap-4 py-3">
                      <span
                        className={cn(
                          'w-32 shrink-0 text-sm',
                          minutes > 0 || date === today
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formatDayRow(date)}
                      </span>
                      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-20 shrink-0 text-right text-sm tabular-nums text-foreground">
                        {formatHrs(minutes)}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                A full bar is the {formatHrs(cap)} weekly max.
              </p>
            </div>
          </div>
        </section>

        {/* ── The selected week's sessions, payment and review ─────────── */}
        <section id="week-details" className="scroll-mt-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Week Details</h2>
          {selectedWeek ? (
            renderWeekCard(selectedWeek)
          ) : (
            <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              {selectedMonday < mondayOf(data.terms.startDate)
                ? `Supervision starts ${formatCalendarDate(data.terms.startDate)}.`
                : 'No billing week for these dates.'}
            </p>
          )}
        </section>
      </div>

      {dialogs}
    </div>
  )
}
