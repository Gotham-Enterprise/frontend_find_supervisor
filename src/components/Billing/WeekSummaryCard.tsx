'use client'

import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useSupervisorWeekSummary } from '@/lib/hooks'
import { formatDuration, formatWeekRange } from '@/lib/utils/date'
import { formatUsdCents } from '@/lib/utils/money'
import type { WeekSummaryRow } from '@/types/sessions'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TOP_SUPERVISEES = 5

/** "2026-10-19" + 7 → "2026-10-26" */
function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** "10/19" for a day-of-week column header */
function monthDay(iso: string): string {
  return `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`
}

/** 75 → "1:15", 120 → "2:00" (compact, for the day grid) */
function hoursColon(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function rowStatus(row: WeekSummaryRow): { text: string; className: string } {
  if (row.status === 'SETTLED') return { text: 'Paid out', className: 'text-primary' }
  if (row.prepayStatus !== 'PAID') return { text: 'Awaiting payment', className: 'text-amber-700' }
  if (row.status === 'DISPUTED') return { text: 'Disputed', className: 'text-destructive' }
  if (row.status === 'APPROVED') return { text: 'Approved', className: 'text-muted-foreground' }
  if (row.status === 'IN_REVIEW') return { text: 'In review', className: 'text-muted-foreground' }
  return { text: 'Logging open', className: 'text-muted-foreground' }
}

/**
 * One week across all hourly hires, Upwork-style: totals, the top supervisees
 * by pay, and an hours-per-day grid with a row per supervisee. Weeks are
 * Monday–Sunday in US Eastern time.
 */
export function WeekSummaryCard() {
  // null = the current week
  const [start, setStart] = useState<string | null>(null)
  const { data, isLoading, isError, isPlaceholderData } = useSupervisorWeekSummary(
    start,
    IN_APP_PAYMENTS_ENABLED,
  )

  if (!IN_APP_PAYMENTS_ENABLED) return null

  const goTo = (iso: string | null) => setStart(iso)
  const previous = data ? shiftIsoDate(data.startDate, -7) : null
  const next = data && data.hasNext ? shiftIsoDate(data.startDate, 7) : null
  const topRows = data
    ? [...data.rows].sort((a, b) => b.netCents - a.netCents).slice(0, TOP_SUPERVISEES)
    : []
  const topMax = topRows[0]?.netCents ?? 0

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarRange className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription className="mt-0.5">
                Hours and pay for one week across your supervisees. Times in US Eastern.
              </CardDescription>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous week"
                disabled={!data.hasPrevious || isPlaceholderData}
                onClick={() => previous && goTo(previous)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="min-w-[11rem] rounded-md border px-3 py-1.5 text-center text-sm font-medium tabular-nums text-foreground">
                {formatWeekRange(data.startDate, data.endDate)}, {data.startDate.slice(0, 4)}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next week"
                disabled={!data.hasNext || isPlaceholderData}
                onClick={() => next && goTo(next)}
              >
                <ChevronRight className="size-4" />
              </Button>
              {data.isCurrentWeek ? (
                <span
                  className={`${buttonVariants({ variant: 'outline', size: 'sm' })} pointer-events-none ml-1 bg-muted/40 text-muted-foreground`}
                  aria-current="date"
                >
                  This week
                </span>
              ) : (
                <Button variant="outline" size="sm" className="ml-1" onClick={() => goTo(null)}>
                  This week
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">We couldn&apos;t load this week.</p>
        ) : (
          <div className={`space-y-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Totals */}
              <dl className="grid grid-cols-2 gap-3 lg:col-span-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">Hours</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                    {data.totals.minutes > 0 ? formatDuration(data.totals.minutes) : '0 h'}
                  </dd>
                  <dd className="text-xs text-muted-foreground">
                    {data.totals.sessions} {data.totals.sessions === 1 ? 'session' : 'sessions'} ·{' '}
                    {data.totals.supervisees}{' '}
                    {data.totals.supervisees === 1 ? 'supervisee' : 'supervisees'}
                  </dd>
                </div>
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">Gross</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                    {formatUsdCents(data.totals.grossCents)}
                  </dd>
                  <dd className="text-xs text-muted-foreground">hours × rate</dd>
                </div>
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">Platform fee</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                    −{formatUsdCents(data.totals.platformFeeCents)}
                  </dd>
                </div>
                <div className="rounded-lg border bg-primary/5 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {data.totals.estimated ? 'Payout (estimated)' : 'Payout'}
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                    {data.totals.estimated ? '≈ ' : ''}
                    {formatUsdCents(data.totals.netCents)}
                  </dd>
                  <dd className="text-xs text-muted-foreground">
                    {data.totals.estimated ? 'after review and platform fee' : 'after platform fee'}
                  </dd>
                </div>
              </dl>

              {/* Top supervisees */}
              <div className="rounded-lg border px-4 py-3 lg:col-span-2">
                <p className="text-xs font-medium text-foreground">
                  Top supervisees
                  {topRows.length > TOP_SUPERVISEES ? ` (top ${TOP_SUPERVISEES})` : ''}
                </p>
                {topRows.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">No sessions this week.</p>
                ) : (
                  <ul className="mt-2 space-y-2.5">
                    {topRows.map((row) => (
                      <li key={row.weekId}>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${topMax > 0 ? Math.max((row.netCents / topMax) * 100, 2) : 0}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-muted-foreground">
                            {row.superviseeName ?? 'Supervisee'}
                          </span>
                          <span className="shrink-0 tabular-nums text-foreground">
                            {row.estimated ? '≈ ' : ''}
                            {formatUsdCents(row.netCents)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Hours per day */}
            {data.rows.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                {data.isCurrentWeek
                  ? 'No billing weeks yet. They start once a supervisee prepays their week.'
                  : 'No billing weeks for this week.'}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium">Supervisee</th>
                      {WEEKDAYS.map((day, i) => (
                        <th key={day} className="px-2 py-2 text-center font-medium">
                          <span className="block">{day}</span>
                          <span className="block font-normal">
                            {monthDay(shiftIsoDate(data.startDate, i))}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right font-medium">Hours</th>
                      <th className="px-4 py-2 text-right font-medium">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.rows.map((row) => {
                      const status = rowStatus(row)
                      return (
                        <tr key={row.weekId} className="hover:bg-muted/30">
                          <td className="px-4 py-2.5">
                            <Link
                              href={row.sessionsPath}
                              className="block max-w-[16rem] truncate font-medium text-foreground hover:underline"
                            >
                              {row.superviseeName ?? 'Supervisee'}
                            </Link>
                            <span className={`text-xs ${status.className}`}>{status.text}</span>
                          </td>
                          {row.days.map((day, i) => (
                            <td
                              key={i}
                              className="px-2 py-2.5 text-center tabular-nums text-foreground"
                              title={
                                day.lateMinutes > 0
                                  ? `Includes ${formatDuration(day.lateMinutes)} added by Gotham support`
                                  : undefined
                              }
                            >
                              {day.minutes > 0 ? (
                                <span className="relative inline-block">
                                  {hoursColon(day.minutes)}
                                  {day.lateMinutes > 0 && (
                                    <span
                                      aria-label="Includes a late entry"
                                      className="absolute -right-2 top-0 size-1.5 rounded-full bg-amber-500"
                                    />
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                            {hoursColon(row.minutes)}
                            {row.billedMinutes !== row.minutes && (
                              <span className="block text-xs text-muted-foreground">
                                {hoursColon(row.billedMinutes)} paid
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                            {row.estimated ? '≈ ' : ''}
                            {formatUsdCents(row.netCents)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30 font-medium">
                      <td className="px-4 py-2.5 text-foreground">Total</td>
                      {WEEKDAYS.map((_, i) => {
                        const minutes = data.rows.reduce((sum, r) => sum + r.days[i].minutes, 0)
                        return (
                          <td
                            key={i}
                            className="px-2 py-2.5 text-center tabular-nums text-foreground"
                          >
                            {minutes > 0 ? hoursColon(minutes) : ''}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {hoursColon(data.totals.minutes)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                        {data.totals.estimated ? '≈ ' : ''}
                        {formatUsdCents(data.totals.netCents)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Click a supervisee to open that week&apos;s sessions. An amber dot marks a day with a
              late entry added by Gotham support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
