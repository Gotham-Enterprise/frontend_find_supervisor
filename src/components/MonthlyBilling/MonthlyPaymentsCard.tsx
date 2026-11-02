'use client'

import { CalendarRange } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IN_APP_MONTHLY_ENABLED } from '@/lib/constants/feature-flags'
import { useMyMonthlyPayments } from '@/lib/hooks/useMonthlyBilling'
import { formatUsdCents } from '@/lib/utils/money'
import type { MonthlyPeriod } from '@/types/monthly-billing'

type Role = 'supervisor' | 'supervisee'

function statusText(period: MonthlyPeriod, role: Role): { text: string; className: string } {
  const green = 'border-emerald-200 bg-emerald-50 text-emerald-800'
  const amber = 'border-amber-200 bg-amber-50 text-amber-800'
  const muted = 'border-border bg-muted text-muted-foreground'
  if (period.status === 'CANCELED') return { text: 'Canceled', className: muted }
  if (period.status === 'SETTLED')
    return { text: role === 'supervisor' ? 'Paid out' : 'Complete', className: green }
  if (period.status === 'DISPUTED') return { text: 'On hold', className: amber }
  if (period.paymentStatus === 'FAILED')
    return { text: 'Unpaid', className: 'border-destructive/30 bg-destructive/5 text-destructive' }
  if (period.paymentStatus === 'PENDING') return { text: 'Not charged yet', className: muted }
  return { text: role === 'supervisor' ? 'Releasing after the month' : 'Paid', className: green }
}

/**
 * Monthly (Medical Director) payments across hires on the Billing page: what a
 * supervisee paid each month, or what a Medical Director was paid. Hidden when
 * there's nothing monthly to show.
 */
export function MonthlyPaymentsCard({ role }: { role: Role }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMyMonthlyPayments(page, IN_APP_MONTHLY_ENABLED)
  if (!IN_APP_MONTHLY_ENABLED) return null
  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />
  if (!data || data.total === 0) return null
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="size-4" aria-hidden />
          {role === 'supervisor' ? 'Monthly Earnings' : 'Monthly Payments'}
        </CardTitle>
        <CardDescription>
          {role === 'supervisor'
            ? `Paid out ${formatUsdCents(data.totals.paidOutCents ?? 0)} · ${formatUsdCents(data.totals.pendingCents ?? 0)} waiting to be released after each month ends.`
            : `Charged ${formatUsdCents(data.totals.chargedCents ?? 0)}${data.totals.refundedCents ? ` · ${formatUsdCents(data.totals.refundedCents)} refunded` : ''}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="divide-y rounded-lg border">
          {data.periods.map((period) => {
            const status = statusText(period, role)
            const amount =
              role === 'supervisor'
                ? formatUsdCents(period.supervisorAmountCents ?? 0)
                : formatUsdCents(period.totalCents ?? 0)
            return (
              <li key={period.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={period.billingPath}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {period.counterpartName ?? 'Supervision'}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{period.label}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className={`${status.className} hover:bg-[inherit]`}>
                    {status.text}
                  </Badge>
                  <span className="w-20 text-right text-sm tabular-nums text-foreground">
                    {amount}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
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
      </CardContent>
    </Card>
  )
}
