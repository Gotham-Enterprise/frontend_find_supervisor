/**
 * Formats cents for USD display. Zero cents → "Free".
 */
export function formatPlanPriceFromCents(priceInCents: number): string {
  if (priceInCents === 0) return 'Free'
  const dollars = priceInCents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Short suffix for plan cards, e.g. MONTHLY → "/month"
 */
export function formatBillingCycleSuffix(billingCycle: string | null | undefined): string {
  if (!billingCycle) return ''
  const normalized = String(billingCycle).toUpperCase()
  if (normalized === 'MONTHLY' || normalized === 'MONTH') return '/month'
  if (normalized === 'YEARLY' || normalized === 'ANNUAL' || normalized === 'YEAR') return '/year'
  if (normalized === 'QUARTERLY') return '/quarter'
  if (normalized === 'WEEKLY') return '/week'
  return ''
}

/**
 * Human-readable billing label for summaries (e.g. "Billed monthly").
 */
export function formatBillingCycleLabel(billingCycle: string | null | undefined): string {
  if (!billingCycle) return ''
  const normalized = String(billingCycle).toUpperCase()
  const map: Record<string, string> = {
    MONTHLY: 'monthly',
    MON: 'monthly',
    YEARLY: 'yearly',
    ANNUAL: 'annually',
    YEAR: 'yearly',
    QUARTERLY: 'quarterly',
    WEEKLY: 'weekly',
  }
  const key = map[normalized] ?? normalized.toLowerCase().replace(/_/g, ' ')
  return `Billed ${key}`
}
