import type { ChoosablePlan, SubscriptionPlan } from '@/types/supervisor-profile'

/** Stable id for the hardcoded Free tier (not returned by the API). */
export const FREE_PLAN_ID = 'free-plan' as const

export const FREE_PLAN: ChoosablePlan = {
  id: FREE_PLAN_ID,
  name: 'Free',
  description: 'Basic access to browse supervisors and explore the platform.',
  priceInCents: 0,
  billingCycle: null,
  isActive: true,
  isFree: true,
}

/**
 * Free plan first, then active paid plans from the API (backend already filters active;
 * we filter again defensively).
 */
export function mergeFreeWithApiPlans(apiPlans: SubscriptionPlan[]): ChoosablePlan[] {
  const paid = apiPlans.filter((p) => p.isActive !== false)
  const paidAsChoosable: ChoosablePlan[] = paid.map((p) => ({
    ...p,
    isFree: false,
  }))
  return [FREE_PLAN, ...paidAsChoosable]
}
