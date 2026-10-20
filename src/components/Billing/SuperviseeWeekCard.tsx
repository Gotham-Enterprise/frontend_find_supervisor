'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import {
  payoutKeys,
  useApproveBillingWeek,
  useDisputeBillingWeek,
  useSuperviseeWeekSummary,
  useUserSnackbar,
} from '@/lib/hooks'
import {
  formatDuration,
  formatEasternDate,
  formatEasternDateTime,
  formatWeekRange,
} from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import type { SuperviseeWeekRow } from '@/types/payouts'

import { DisputeAttachmentsField } from '../HireSessions/DisputeAttachmentsField'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DISPUTE_REASON_MAX = 1000

/** "2026-10-19" + 7 → "2026-10-26" */
function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** 75 → "1:15" */
function hoursColon(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

function rowStatus(row: SuperviseeWeekRow): { text: string; className: string } {
  if (row.prepayStatus === 'FAILED')
    return { text: "Payment didn't go through", className: 'text-destructive' }
  if (row.status === 'SETTLED') {
    return {
      text: row.refundCents
        ? `Refund of ${formatUsdCents(row.refundCents)} sent ${row.settledAt ? formatEasternDate(row.settledAt) : ''}`.trim()
        : 'Settled',
      className: 'text-muted-foreground',
    }
  }
  if (row.status === 'DISPUTED')
    return { text: 'Disputed · with Gotham support', className: 'text-destructive' }
  if (row.status === 'IN_REVIEW')
    return {
      text: `Review by ${formatEasternDateTime(row.reviewEndsAt)}`,
      className: 'text-amber-700',
    }
  if (row.status === 'APPROVED')
    return { text: 'Approved · refund on its way', className: 'text-muted-foreground' }
  return {
    text: `Prepaid · logging until ${formatEasternDate(row.logDeadlineAt)}`,
    className: 'text-muted-foreground',
  }
}

/** Approve / dispute for a week in review, or the way to Pay now; each row has its own hire. */
function RowActions({ row }: { row: SuperviseeWeekRow }) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useUserSnackbar()
  const approve = useApproveBillingWeek(row.hireId)
  const dispute = useDisputeBillingWeek(row.hireId)
  const [approving, setApproving] = useState(false)
  const [disputing, setDisputing] = useState(false)
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const refresh = () => queryClient.invalidateQueries({ queryKey: payoutKeys.all })

  if (row.canPayNow) {
    return (
      <Link href={row.sessionsPath} className={buttonVariants({ size: 'sm' })}>
        Pay now
      </Link>
    )
  }
  if (!row.canReview) {
    return (
      <Link href={row.sessionsPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        View sessions
      </Link>
    )
  }
  return (
    <>
      <Link href={row.sessionsPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        View sessions
      </Link>
      <Button variant="outline" size="sm" onClick={() => setDisputing(true)}>
        Dispute
      </Button>
      <Button size="sm" onClick={() => setApproving(true)}>
        Approve
      </Button>

      <ConfirmDialog
        open={approving}
        onOpenChange={setApproving}
        title="Approve this week?"
        description={`${row.supervisorName ?? 'Your supervisor'} will be paid for ${formatDuration(row.billedMinutes)} (${formatUsdCents(row.hoursChargeCents)}), and ${formatUsdCents(row.expectedRefundCents)} of your prepay is refunded to your card.`}
        confirmLabel="Approve"
        isPending={approve.isPending}
        onConfirm={() =>
          approve.mutate(row.weekId, {
            onSuccess: () => {
              setApproving(false)
              showSuccess('Week approved', {
                description: 'Your supervisor will be paid and the unused prepay refunded.',
              })
              void refresh()
            },
            onError: (err) => showError(parseApiError(err)),
          })
        }
      />
      <ConfirmDialog
        open={disputing}
        onOpenChange={(open) => {
          setDisputing(open)
          if (!open) {
            setReason('')
            setFiles([])
          }
        }}
        title="Dispute this week?"
        description="Tell Gotham support what doesn't match. The week is frozen until they resolve it, and nothing is paid out in the meantime."
        confirmLabel="Submit dispute"
        destructive
        isPending={dispute.isPending}
        confirmDisabled={reason.trim().length === 0}
        onConfirm={() =>
          dispute.mutate(
            { weekId: row.weekId, reason: reason.trim(), attachments: files },
            {
              onSuccess: () => {
                setDisputing(false)
                setReason('')
                setFiles([])
                showSuccess('Week disputed', {
                  description: 'Gotham support will review the week and contact you.',
                })
                void refresh()
              },
              onError: (err) => showError(parseApiError(err)),
            },
          )
        }
      >
        <Textarea
          rows={4}
          maxLength={DISPUTE_REASON_MAX}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. We only met for 30 minutes on Oct 19, not 2 hours."
          disabled={dispute.isPending}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {reason.length} / {DISPUTE_REASON_MAX}
        </p>
        <DisputeAttachmentsField files={files} onChange={setFiles} disabled={dispute.isPending} />
      </ConfirmDialog>
    </>
  )
}

/**
 * The supervisee's weekly summary: what was prepaid, the hours each
 * supervisor logged per day, the expected refund, and anything that needs
 * them (a week to review, a payment that failed). Weeks are Monday–Sunday,
 * US Eastern.
 */
export function SuperviseeWeekCard() {
  const [start, setStart] = useState<string | null>(null)
  const { data, isLoading, isError, isPlaceholderData } = useSuperviseeWeekSummary(
    start,
    IN_APP_PAYMENTS_ENABLED,
  )

  if (!IN_APP_PAYMENTS_ENABLED) return null
  const previous = data ? shiftIsoDate(data.startDate, -7) : null
  const next = data && data.hasNext ? shiftIsoDate(data.startDate, 7) : null

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
                What you prepaid, the hours logged so far, and what comes back. Times in US Eastern.
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
                onClick={() => previous && setStart(previous)}
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
                onClick={() => next && setStart(next)}
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
                <Button variant="outline" size="sm" className="ml-1" onClick={() => setStart(null)}>
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
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">We couldn&apos;t load this week.</p>
        ) : (
          <div className={`space-y-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
            {data.totals.needsReview > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {data.totals.needsReview === 1
                  ? 'A week is waiting for your review. Approve it if the sessions happened as logged, or dispute it.'
                  : `${data.totals.needsReview} weeks are waiting for your review.`}
              </p>
            )}
            {data.totals.unpaid > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />A
                weekly payment didn&apos;t go through. Tap Pay now so sessions can keep being
                logged.
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Hours logged</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {data.totals.minutes > 0 ? formatDuration(data.totals.minutes) : '0 h'}
                </dd>
                <dd className="text-xs text-muted-foreground">
                  {data.totals.sessions} {data.totals.sessions === 1 ? 'session' : 'sessions'} ·{' '}
                  {data.totals.supervisors}{' '}
                  {data.totals.supervisors === 1 ? 'supervisor' : 'supervisors'}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Prepaid</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.prepaidCents)}
                </dd>
                <dd className="text-xs text-muted-foreground">weekly max + service fee</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">
                  {data.totals.estimated ? 'Expected refund' : 'Refunded'}
                </dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {data.totals.estimated ? '≈ ' : ''}
                  {formatUsdCents(data.totals.expectedRefundCents)}
                </dd>
                <dd className="text-xs text-muted-foreground">for hours not used</dd>
              </div>
              <div className="rounded-lg border bg-primary/5 px-4 py-3">
                <dt className="text-xs text-muted-foreground">
                  {data.totals.estimated ? 'Your cost (estimated)' : 'Your cost'}
                </dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {data.totals.estimated ? '≈ ' : ''}
                  {formatUsdCents(data.totals.costCents)}
                </dd>
                <dd className="text-xs text-muted-foreground">hours + service fee</dd>
              </div>
            </dl>

            {data.rows.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                {data.isCurrentWeek
                  ? 'No billing weeks yet. Your first prepay is charged when a signed hourly agreement starts.'
                  : 'No billing weeks for this week.'}
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {data.rows.map((row) => {
                  const status = rowStatus(row)
                  return (
                    <li key={row.weekId} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={row.sessionsPath}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {row.supervisorName ?? 'Supervisor'}
                          </Link>
                          <p className={`text-xs ${status.className}`}>{status.text}</p>
                          {row.failureMessage && (
                            <p className="text-xs text-destructive">{row.failureMessage}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {row.estimated ? '≈ ' : ''}
                            {formatUsdCents(row.costCents)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(row.billedMinutes)} ×{' '}
                            {formatUsdCents(row.hourlyRateCents)}
                            /h + fee
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-7 gap-1">
                        {row.days.map((day, i) => (
                          <div
                            key={i}
                            className={`rounded-md border px-1 py-1 text-center ${
                              day.minutes > 0 ? 'bg-primary/5' : 'bg-muted/20'
                            }`}
                            title={
                              day.lateMinutes > 0
                                ? `Includes ${formatDuration(day.lateMinutes)} added by Gotham support`
                                : undefined
                            }
                          >
                            <span className="block text-[10px] uppercase text-muted-foreground">
                              {WEEKDAYS[i]} {Number(shiftIsoDate(data.startDate, i).slice(8, 10))}
                            </span>
                            <span className="block text-xs tabular-nums text-foreground">
                              {day.minutes > 0 ? hoursColon(day.minutes) : '—'}
                              {day.lateMinutes > 0 && (
                                <span
                                  aria-label="Includes a late entry"
                                  className="ml-0.5 inline-block size-1.5 rounded-full bg-amber-500 align-middle"
                                />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                        <RowActions row={row} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
