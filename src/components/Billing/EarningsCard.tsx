'use client'

import { ChevronDown, Download, Wallet } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { exportSupervisorEarnings } from '@/lib/api/supervision'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useSupervisorEarnings, useUserSnackbar } from '@/lib/hooks'
import {
  formatCalendarDate,
  formatDuration,
  formatEasternDate,
  formatEasternDateTime,
  formatWeekRange,
  toEasternISODate,
} from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import type { EarningsMonth, EarningsWeek } from '@/types/sessions'

const PAGE_SIZE = 10

/** Where the week's money stands, from the supervisor's side, with its next date. */
function weekStage(week: EarningsWeek): { text: string; className: string } {
  if (week.status === 'SETTLED') {
    return {
      text: week.settledAt ? `Paid out ${formatEasternDate(week.settledAt)}` : 'Paid out',
      className: 'text-primary',
    }
  }
  if (week.prepayStatus !== 'PAID') {
    return { text: "Awaiting your supervisee's payment", className: 'text-amber-700' }
  }
  if (week.status === 'DISPUTED') {
    return { text: 'Disputed · with Gotham support', className: 'text-destructive' }
  }
  if (week.status === 'APPROVED') {
    return { text: 'Approved · paying out', className: 'text-muted-foreground' }
  }
  if (week.status === 'IN_REVIEW') {
    return {
      text: `Under review until ${formatEasternDate(week.reviewEndsAt)}`,
      className: 'text-muted-foreground',
    }
  }
  return {
    text: `Logging until ${formatEasternDate(week.logDeadlineAt)}`,
    className: 'text-muted-foreground',
  }
}

function approvedByText(week: EarningsWeek): string {
  switch (week.approvedBy) {
    case 'SUPERVISEE':
      return 'by your supervisee'
    case 'SUPPORT':
      return 'by Gotham support'
    case 'AUTO':
      return 'automatically after the review'
    default:
      return ''
  }
}

/** "2026-10" → "Oct 2026" */
function formatMonth(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const LATE_CHARGE_TEXT: Record<EarningsWeek['lateEntries'][number]['chargeStatus'], string> = {
  PAID: 'paid out',
  PENDING: 'charge pending',
  FAILED: "charge didn't go through",
  CANCELED: 'canceled',
}

/** The week's money (gross, fee, net), late entries, timeline and payout reference. */
function WeekDetails({ week }: { week: EarningsWeek }) {
  const feePercent = week.platformFeeBps / 100
  const timeline: { label: string; value: string }[] = []
  if (week.prepaidAt)
    timeline.push({ label: 'Prepaid by your supervisee', value: formatEasternDate(week.prepaidAt) })
  else if (week.prepayStatus === 'FAILED')
    timeline.push({ label: 'Prepay', value: "Didn't go through; your supervisee was asked to pay" })
  timeline.push({ label: 'Logging deadline', value: formatEasternDateTime(week.logDeadlineAt) })
  if (week.disputedAt)
    timeline.push({ label: 'Disputed', value: formatEasternDate(week.disputedAt) })
  if (week.approvedAt) {
    timeline.push({
      label: 'Approved',
      value: `${formatEasternDate(week.approvedAt)} ${approvedByText(week)}`.trim(),
    })
  } else if (week.status !== 'SETTLED') {
    timeline.push({ label: 'Review ends', value: formatEasternDateTime(week.reviewEndsAt) })
  }
  if (week.settledAt) timeline.push({ label: 'Paid out', value: formatEasternDate(week.settledAt) })

  return (
    <div className="grid gap-4 border-t bg-muted/20 px-4 py-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium text-foreground">
          {week.estimated ? 'Estimated payout' : 'Payout'}
        </p>
        <dl className="mt-1.5 space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {formatDuration(week.billedMinutes)} × {formatUsdCents(week.hourlyRateCents)}/h
            </dt>
            <dd className="tabular-nums text-foreground">{formatUsdCents(week.grossCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Platform fee ({feePercent}%)</dt>
            <dd className="tabular-nums text-foreground">
              −{formatUsdCents(week.platformFeeCents)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-1 font-medium">
            <dt className="text-foreground">Your payout</dt>
            <dd className="tabular-nums text-foreground">
              {week.estimated ? '≈ ' : ''}
              {formatUsdCents(week.netCents)}
            </dd>
          </div>
        </dl>
        {week.estimated && week.approvedMinutes == null && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Based on the hours logged so far; your supervisee approves them after the week.
          </p>
        )}
        {week.lateEntries.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-foreground">Late entries, paid separately</p>
            <ul className="mt-1 space-y-1 text-sm">
              {week.lateEntries.map((late) => (
                <li key={late.id} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {formatCalendarDate(late.sessionDate)} · {formatDuration(late.durationMinutes)}{' '}
                    · {LATE_CHARGE_TEXT[late.chargeStatus]}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {formatUsdCents(late.netCents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Timeline</p>
        <dl className="mt-1.5 space-y-1 text-sm">
          {timeline.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        {week.stripeTransferId && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sent to your Stripe account (transfer{' '}
            <span className="font-mono text-foreground">{week.stripeTransferId}</span>). It reaches
            your bank on your Stripe payout schedule.
          </p>
        )}
      </div>
    </div>
  )
}

function MonthlyTable({ months }: { months: EarningsMonth[] }) {
  const anyPaid = months.some((m) => m.paidOutCents > 0)
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th className="py-1.5 font-medium">Month</th>
          <th className="py-1.5 text-right font-medium">Weeks</th>
          <th className="py-1.5 text-right font-medium">Hours</th>
          <th className="py-1.5 text-right font-medium">Paid out</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {months.map((m) => (
          <tr key={m.month}>
            <td className="py-1.5 text-foreground">{formatMonth(m.month)}</td>
            <td className="py-1.5 text-right tabular-nums text-muted-foreground">{m.weeks}</td>
            <td className="py-1.5 text-right tabular-nums text-muted-foreground">
              {m.minutes > 0 ? formatDuration(m.minutes) : '—'}
            </td>
            <td className="py-1.5 text-right tabular-nums text-foreground">
              {formatUsdCents(m.paidOutCents)}
            </td>
          </tr>
        ))}
      </tbody>
      {!anyPaid && (
        <caption className="caption-bottom pt-2 text-left text-xs text-muted-foreground">
          Payouts land here in the month they&apos;re sent.
        </caption>
      )}
    </table>
  )
}

/**
 * In-app earnings across all hourly hires: what was paid out per billing week
 * (after the platform fee), an estimate for prepaid weeks still in progress,
 * a per-supervisee summary, the last months, and a CSV export.
 */
export function EarningsCard() {
  const [page, setPage] = useState(1)
  const [hireId, setHireId] = useState<string | null>(null)
  const [openWeekId, setOpenWeekId] = useState<string | null>(null)
  const [showMonths, setShowMonths] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { showError } = useUserSnackbar()
  const { data, isLoading, isError } = useSupervisorEarnings(page, IN_APP_PAYMENTS_ENABLED, hireId)

  if (!IN_APP_PAYMENTS_ENABLED) return null
  const totalPages = data ? Math.max(Math.ceil(data.totalCount / PAGE_SIZE), 1) : 1

  const selectSupervisee = (id: string | null) => {
    setHireId((current) => (current === id ? null : id))
    setPage(1)
    setOpenWeekId(null)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportSupervisorEarnings()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `supervision-earnings-${toEasternISODate()}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      showError(parseApiError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Supervision Earnings</CardTitle>
              <CardDescription className="mt-0.5">
                Weekly payouts for sessions your supervisees approved, after the platform fee.
              </CardDescription>
            </div>
          </div>
          {data && data.totalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={exporting}
              onClick={() => void handleExport()}
            >
              <Download className="size-3.5" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">We couldn&apos;t load your earnings.</p>
        ) : (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Paid out</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.paidOutCents)}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">In progress (estimated)</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.pendingCents)}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Paid out this month</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.paidOutThisMonthCents)}
                </dd>
              </div>
            </dl>

            {data.bySupervisee.length > 1 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground">By supervisee</p>
                <ul className="divide-y rounded-lg border">
                  {data.bySupervisee.map((s) => {
                    const selected = hireId === s.hireId
                    return (
                      <li key={s.hireId}>
                        <button
                          type="button"
                          onClick={() => selectSupervisee(s.hireId)}
                          aria-pressed={selected}
                          className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors hover:bg-muted/40 ${
                            selected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {s.superviseeName ?? 'Supervisee'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {s.weeks} {s.weeks === 1 ? 'week' : 'weeks'} ·{' '}
                              {formatDuration(s.minutes)}
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-xs text-muted-foreground">
                            <span className="block text-sm font-semibold tabular-nums text-foreground">
                              {formatUsdCents(s.paidOutCents)}
                            </span>
                            {s.pendingCents > 0 &&
                              `≈ ${formatUsdCents(s.pendingCents)} in progress`}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {hireId && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Showing one supervisee&apos;s weeks.{' '}
                    <button
                      type="button"
                      onClick={() => selectSupervisee(null)}
                      className="font-medium text-primary hover:underline"
                    >
                      Show all
                    </button>
                  </p>
                )}
              </div>
            )}

            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No earnings yet. Weeks show up here once your supervisees&apos; prepays go through.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {data.items.map((week) => {
                  const stage = weekStage(week)
                  const amount = week.status === 'SETTLED' ? week.paidOutCents : week.pendingCents
                  const open = openWeekId === week.id
                  return (
                    <li key={week.id}>
                      <button
                        type="button"
                        onClick={() => setOpenWeekId(open ? null : week.id)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {formatWeekRange(week.startDate, week.endDate)}
                            <span className="font-normal text-muted-foreground">
                              {' '}
                              · {week.superviseeName ?? 'Supervisee'}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(week.billedMinutes)}
                            {week.approvedMinutes != null && week.approvedMinutes !== week.minutes
                              ? ` of ${formatDuration(week.minutes)} logged`
                              : ''}{' '}
                            · <span className={stage.className}>{stage.text}</span>
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {week.status !== 'SETTLED' && amount > 0 ? '≈ ' : ''}
                            {formatUsdCents(amount)}
                          </span>
                          <ChevronDown
                            className={`size-4 text-muted-foreground transition-transform ${
                              open ? 'rotate-180' : ''
                            }`}
                            aria-hidden
                          />
                        </span>
                      </button>
                      {open && <WeekDetails week={week} />}
                    </li>
                  )
                })}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}

            {data.totalCount > 0 && (
              <div className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => setShowMonths((v) => !v)}
                  aria-expanded={showMonths}
                  className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  Last {data.monthly.length} months
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${
                      showMonths ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                {showMonths && (
                  <div className="border-t px-4 py-3">
                    <MonthlyTable months={data.monthly} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
