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
 * the platform fee; the supervisee sees the most a week can cost (weekly max
 * plus the service fee) — they're charged after each Friday's cutoff for the
 * hours actually logged.
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
            The supervisee is charged after each Friday&apos;s cutoff for the hours you log, plus a
            service fee — {formatUsdCents(quote.weeklyTotalCents)} at the agreed weekly max ({cap}{' '}
            plus a {formatUsdCents(quote.serviceFeeCents)} service fee). Hours over the max are
            flagged on their invoice, and they can report a problem. You&apos;re paid every Tuesday
            for the previous week, after they review it.
          </p>
        </>
      ) : (
        <>
          <Row label="Hourly rate" value={formatUsdCents(quote.hourlyRateCents)} />
          <Row label="Max per week" value={cap} />
          <Row label="Agreed weekly maximum" value={formatUsdCents(quote.weeklyPrepayCents)} />
          <Row label="Service fee (at the maximum)" value={formatUsdCents(quote.serviceFeeCents)} />
          <Row
            label="Weekly total at the maximum"
            value={formatUsdCents(quote.weeklyTotalCents)}
            strong
          />
          <p className="pt-1 text-xs text-muted-foreground">
            You pay only for the hours your supervisor logs: your card is charged after each
            Friday&apos;s cutoff for those hours plus a service fee. The weekly maximum is what you
            agree to; hours logged over it are flagged on your invoice and you can report a problem.
            If a problem report lowers the hours, the difference for those hours goes back to your
            card. The service fee covers secure payment processing by Stripe and isn&apos;t
            returned.
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
