import { formatUsdCents } from '@/lib/utils/money'
import type { WeeklyQuote } from '@/types/payouts'

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
 * Weekly charge breakdown. The supervisor sees what they receive after the
 * platform fee; the supervisee sees the weekly rate plus the service fee.
 */
export function WeeklyQuoteSummary({
  quote,
  perspective,
  durationWeeks,
}: {
  quote: WeeklyQuote
  perspective: 'supervisor' | 'supervisee'
  durationWeeks?: number | null
}) {
  const weeks = durationWeeks && durationWeeks > 0 ? durationWeeks : null
  const feePct = quote.platformFeeBps / 100

  return (
    <dl className="space-y-1.5 rounded-lg border bg-muted/30 px-4 py-3">
      {perspective === 'supervisor' ? (
        <>
          <Row label="Weekly rate" value={formatUsdCents(quote.weeklyAmountCents)} />
          <Row
            label={`Platform fee (${feePct}%)`}
            value={`−${formatUsdCents(quote.platformFeeCents)}`}
          />
          <Row
            label="You receive each week"
            value={formatUsdCents(quote.supervisorAmountCents)}
            strong
          />
          {weeks && (
            <Row
              label={`Total over ${weeks} week${weeks === 1 ? '' : 's'}`}
              value={formatUsdCents(quote.supervisorAmountCents * weeks)}
            />
          )}
          <p className="pt-1 text-xs text-muted-foreground">
            The supervisee pays {formatUsdCents(quote.totalCents)}/week, including a{' '}
            {formatUsdCents(quote.serviceFeeCents)} service fee for payment processing.
          </p>
        </>
      ) : (
        <>
          <Row label="Weekly rate" value={formatUsdCents(quote.weeklyAmountCents)} />
          <Row label="Service fee" value={formatUsdCents(quote.serviceFeeCents)} />
          <Row label="Charged each week" value={formatUsdCents(quote.totalCents)} strong />
          {weeks && (
            <Row
              label={`Total over ${weeks} week${weeks === 1 ? '' : 's'}`}
              value={formatUsdCents(quote.totalCents * weeks)}
            />
          )}
          <p className="pt-1 text-xs text-muted-foreground">
            The service fee covers secure payment processing by Stripe.
          </p>
        </>
      )}
    </dl>
  )
}
