import { isFreePlan } from '@/lib/constants/subscription-plans'
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/supervisor-profile'

/** Display name from GET /supervision/plans (seed). */
export const SUPERVISION_PLAN_NAME_FREE = 'Find a Supervisor Free Plan'

export const SUPERVISION_PLAN_NAME_PLATFORM_ACCESS = 'Find a Supervisor Platform Access'

export function isSupervisionFreePlanDisplayName(name: string | null | undefined): boolean {
  return name?.trim() === SUPERVISION_PLAN_NAME_FREE
}

/**
 * Premium “all features unlocked” dashboard card: Platform Access plan with ACTIVE status.
 */
export function shouldShowSupervisionPremiumSubscriptionCard(
  planName: string | null | undefined,
  status: SubscriptionStatus | null | undefined,
): boolean {
  if (planName?.trim() !== SUPERVISION_PLAN_NAME_PLATFORM_ACCESS) return false
  return status === 'ACTIVE'
}

/** User is on the free tier (by canonical name or zero price). */
export function isSupervisionFreeTierSubscription(
  planName: string | null | undefined,
  plan: SubscriptionPlan | null | undefined,
): boolean {
  if (isSupervisionFreePlanDisplayName(planName)) return true
  if (plan && isFreePlan(plan)) return true
  return false
}
