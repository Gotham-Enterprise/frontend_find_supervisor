import type { SubscriptionPlan } from '@/types/supervisor-profile'

/**
 * True if the plan is a free tier (priceInCents === 0).
 * Prefer this over name-matching so the check stays correct if the plan name ever changes.
 */
export function isFreePlan(plan: SubscriptionPlan): boolean {
  return plan.priceInCents === 0
}

/**
 * True if the plan is a paid plan that can go through Stripe checkout.
 * A plan can only be checked out if it costs money AND has a Stripe price attached.
 */
export function canCheckoutPlan(plan: SubscriptionPlan): boolean {
  return plan.priceInCents > 0 && plan.stripePriceId != null
}

/**
 * Returns plans sorted by price ascending (free first, then paid tiers cheapest first).
 * Inactive plans are excluded.
 */
export function sortPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return [...plans]
    .filter((p) => p.isActive !== false)
    .sort((a, b) => a.priceInCents - b.priceInCents)
}

/**
 * Returns the feature bullet-point list for a plan.
 * Prefers the `features` array from the API; falls back to splitting `description` by newlines;
 * returns the fallback array if neither yields results.
 */
export function planFeatures(plan: SubscriptionPlan, fallback: string[] = []): string[] {
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features
  }
  const desc = plan.description?.trim()
  if (desc) {
    const lines = desc
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length > 0) return lines
  }
  return fallback
}
