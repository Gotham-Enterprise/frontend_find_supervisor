import { Skeleton } from '@/components/ui/skeleton'
import { formatUsdCents } from '@/lib/utils/money'
import type { HourlyQuote } from '@/types/payouts'

/** 90 → "1.5 hours", 60 → "1 hour". */
export function formatHours(minutes: number): string {
  const hours = minutes / 60
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

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
 * Hourly terms breakdown. The supervisor sees what they receive per hour after
 * the platform fee; the supervisee sees the weekly prepay plus the service fee.
 */
export function HourlyQuoteSummary({
  quote,
  perspective,
}: {
  quote: HourlyQuote
  perspective: 'supervisor' | 'supervisee'
}) {
  const feePct = quote.platformFeeBps / 100
  const cap = formatHours(quote.weeklyCapMinutes)

  return (
    <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3">
      {perspective === 'supervisor' ? (
        <>
          <Row label="Hourly rate" value={formatUsdCents(quote.hourlyRateCents)} />
          <Row
            label={`Platform fee (${feePct}%)`}
            value={`−${formatUsdCents(quote.hourlyPlatformFeeCents)}`}
          />
          <Row
            label="You receive per hour"
            value={formatUsdCents(quote.supervisorHourlyCents)}
            strong
          />
          <Row
            label={`Most you receive per week (${cap})`}
            value={formatUsdCents(quote.supervisorWeeklyMaxCents)}
          />
          <p className="pt-1 text-xs text-muted-foreground">
            The supervisee prepays {formatUsdCents(quote.weeklyTotalCents)} at the start of each
            week ({cap} plus a {formatUsdCents(quote.serviceFeeCents)} service fee). You&apos;re
            paid for the hours you log once they approve the week; unused prepay is refunded to
            them.
          </p>
        </>
      ) : (
        <>
          <Row label="Hourly rate" value={formatUsdCents(quote.hourlyRateCents)} />
          <Row label="Max per week" value={cap} />
          <Row label="Weekly payment" value={formatUsdCents(quote.weeklyPrepayCents)} />
          <Row label="Service fee" value={formatUsdCents(quote.serviceFeeCents)} />
          <Row
            label="Charged at the start of each week"
            value={formatUsdCents(quote.weeklyTotalCents)}
            strong
          />
          <p className="pt-1 text-xs text-muted-foreground">
            You only pay for approved hours: after you review each week&apos;s sessions, any unused
            prepay is refunded. The service fee covers secure payment processing by Stripe and
            isn&apos;t refunded.
          </p>
        </>
      )}
    </dl>
  )
}

/**
 * Same box, rows and note as the summary, so swapping between the two while a
 * quote is (re)fetched doesn't shift the form around.
 */
export function HourlyQuoteSummarySkeleton({
  perspective,
}: {
  perspective: 'supervisor' | 'supervisee'
}) {
  const rows = perspective === 'supervisor' ? 4 : 5
  return (
    <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 py-0.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
      <div className="space-y-1.5 pt-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </dl>
  )
}
