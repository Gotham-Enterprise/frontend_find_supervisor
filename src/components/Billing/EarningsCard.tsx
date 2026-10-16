'use client'

import { Wallet } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayoutStatusQuery, useSupervisorEarnings } from '@/lib/hooks'
import { formatDuration, formatWeekRange } from '@/lib/utils/date'
import { formatUsdCents } from '@/lib/utils/money'
import type { EarningsWeek } from '@/types/sessions'

const PAGE_SIZE = 10

/** Where the week's money stands, from the supervisor's side. */
function weekState(week: EarningsWeek): { text: string; className: string } {
  if (week.status === 'SETTLED') {
    return { text: 'Paid out', className: 'text-primary' }
  }
  if (week.prepayStatus !== 'PAID') {
    return { text: 'Unpaid week', className: 'text-amber-700' }
  }
  if (week.status === 'DISPUTED') {
    return { text: 'Disputed', className: 'text-destructive' }
  }
  return { text: 'In progress', className: 'text-muted-foreground' }
}

/**
 * In-app earnings across all hourly hires: what was paid out per billing week
 * (after the platform fee) and an estimate for prepaid weeks still in progress.
 */
export function EarningsCard() {
  const { data: payoutStatus } = usePayoutStatusQuery(true)
  const [page, setPage] = useState(1)
  const enabled = Boolean(payoutStatus?.inAppPaymentsPilot)
  const { data, isLoading, isError } = useSupervisorEarnings(page, enabled)

  if (!enabled) return null
  const totalPages = data ? Math.max(Math.ceil(data.totalCount / PAGE_SIZE), 1) : 1

  return (
    <Card className="max-w-2xl">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle>Supervision earnings</CardTitle>
            <CardDescription className="mt-0.5">
              Weekly payouts for sessions your supervisees approved, after the platform fee.
            </CardDescription>
          </div>
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
            <dl className="grid grid-cols-2 gap-4">
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
            </dl>

            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No earnings yet. Weeks show up here once your supervisees&apos; prepays go through.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {data.items.map((week) => {
                  const state = weekState(week)
                  const amount = week.status === 'SETTLED' ? week.paidOutCents : week.pendingCents
                  return (
                    <li key={week.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formatWeekRange(week.startDate, week.endDate)}
                          <span className="font-normal text-muted-foreground">
                            {' '}
                            · {week.superviseeName ?? 'Supervisee'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(week.approvedMinutes ?? week.minutes)} ·{' '}
                          <span className={state.className}>{state.text}</span>
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {week.status !== 'SETTLED' && amount > 0 ? '≈ ' : ''}
                        {formatUsdCents(amount)}
                      </span>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
