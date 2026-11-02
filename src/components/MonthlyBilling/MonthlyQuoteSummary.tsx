import { Skeleton } from '@/components/ui/skeleton'
import { formatUsdCents } from '@/lib/utils/money'
import type { MonthlyQuote } from '@/types/monthly-billing'

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt
        className={strong ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}
      >
        {label}
      </dt>
      <dd
        className={
          strong ? 'text-sm font-semibold tabular-nums text-foreground' : 'text-sm tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  )
}

/**
 * Monthly terms breakdown. The Medical Director sees what they receive each
 * month after the platform fee; the supervisee sees the monthly charge with
 * its service fee.
 */
export function MonthlyQuoteSummary({
  quote,
  perspective,
}: {
  quote: MonthlyQuote
  perspective: 'supervisor' | 'supervisee'
}) {
  if (perspective === 'supervisor') {
    const feePct = (quote.platformFeeBps ?? 0) / 100
    return (
      <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3">
        <Row label="Monthly amount" value={formatUsdCents(quote.monthlyAmountCents)} />
        <Row
          label={`Platform fee (${feePct}%)`}
          value={`−${formatUsdCents(quote.platformFeeCents ?? 0)}`}
        />
        <Row
          label="You receive each month"
          value={formatUsdCents(quote.supervisorMonthlyCents ?? 0)}
          strong
        />
        <p className="pt-1 text-xs text-muted-foreground">
          Your client pays {formatUsdCents(quote.monthlyTotalCents)} at the start of each month (
          {formatUsdCents(quote.monthlyAmountCents)} plus a {formatUsdCents(quote.serviceFeeCents)}{' '}
          service fee). The platform holds it and releases your share 3 days after the month ends,
          unless they report a problem.
        </p>
      </dl>
    )
  }
  return (
    <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3">
      <Row label="Monthly amount" value={formatUsdCents(quote.monthlyAmountCents)} />
      <Row label="Service fee" value={formatUsdCents(quote.serviceFeeCents)} />
      <Row
        label="Charged at the start of each month"
        value={formatUsdCents(quote.monthlyTotalCents)}
        strong
      />
      <p className="pt-1 text-xs text-muted-foreground">
        Charged on the start date, then on the same day each month. If you end the supervision, it
        stays active until the end of the month you paid for, and that month isn&apos;t refunded.
        The service fee covers secure payment processing by Stripe and isn&apos;t refunded.
      </p>
    </dl>
  )
}

/** Same box and rows as the summary, so the form doesn't shift while a quote loads. */
export function MonthlyQuoteSummarySkeleton() {
  return (
    <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 py-0.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
      <div className="space-y-1.5 pt-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </dl>
  )
}
