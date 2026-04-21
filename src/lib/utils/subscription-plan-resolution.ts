import { isFreePlan } from '@/lib/constants/subscription-plans'
import type { ChoosablePlan, Subscription, SubscriptionStatus } from '@/types/supervisor-profile'

/** Paid access is considered active for these statuses. */
const ACTIVE_PAID_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE']

function isActivePaidSubscription(s: Subscription): boolean {
  return ACTIVE_PAID_STATUSES.includes(s.status) && !isFreePlan(s.plan)
}

/** True if the user has at least one paid supervision subscription in good standing. */
export function hasActivePaidSupervisionSubscription(
  subscriptions: Subscription[] | null | undefined,
): boolean {
  if (!subscriptions?.length) return false
  return subscriptions.some(isActivePaidSubscription)
}

/** Newest subscription row that counts as paid access (for plan name / renewal UI). */
export function getActivePaidSupervisionSubscription(
  subscriptions: Subscription[] | null | undefined,
): Subscription | undefined {
  if (!subscriptions?.length) return undefined
  return subscriptions.find(isActivePaidSubscription)
}

/** Checkout started but payment not completed (Stripe subscription still incomplete). */
const PENDING_CHECKOUT_STATUSES: SubscriptionStatus[] = ['INACTIVE']

/** No longer entitled to paid tier — treat as free for "current plan" UI. */
const NON_ENTITLED_STATUSES: SubscriptionStatus[] = ['CANCELED', 'UNPAID']

export type CurrentPlanResolution = {
  /**
   * The plan ID from the API that reflects the user's current entitlement.
   * Resolves to the free plan's ID when the user has no active paid subscription.
   * `null` only when plans haven't loaded yet.
   */
  choosablePlanId: string | null
  /** User has an active paid subscription on that plan. */
  isActivePaid: boolean
  /** Subscription exists but payment / activation not finished. */
  isPendingActivation: boolean
}

function paidPlans(plans: ChoosablePlan[]): ChoosablePlan[] {
  return plans.filter((p) => !isFreePlan(p))
}

/**
 * Maps an API subscription + list of available plans to the stable plan ID used in the
 * plan picker. Falls back to the free plan's ID when the user has no active paid subscription.
 * Prefers `plan.id` / `planId`, then Stripe price id match, then Stripe product id match.
 */
export function resolveCurrentChoosablePlan(
  subscription: Subscription | null | undefined,
  plans: ChoosablePlan[],
): CurrentPlanResolution {
  const freePlanId = plans.find(isFreePlan)?.id ?? null

  if (!subscription?.plan) {
    return {
      choosablePlanId: freePlanId,
      isActivePaid: false,
      isPendingActivation: false,
    }
  }

  const { status, plan } = subscription
  const targetPlanId = subscription.planId ?? plan.id

  const matchById = paidPlans(plans).find((p) => p.id === targetPlanId)
  const matchByStripe =
    !matchById && plan.stripePriceId
      ? paidPlans(plans).find((p) => p.stripePriceId === plan.stripePriceId)
      : undefined
  const matchByProduct =
    !matchById && !matchByStripe && plan.stripeProductId
      ? paidPlans(plans).find((p) => p.stripeProductId === plan.stripeProductId)
      : undefined

  const matched = matchById ?? matchByStripe ?? matchByProduct

  if (NON_ENTITLED_STATUSES.includes(status)) {
    return {
      choosablePlanId: freePlanId,
      isActivePaid: false,
      isPendingActivation: false,
    }
  }

  if (ACTIVE_PAID_STATUSES.includes(status)) {
    return {
      choosablePlanId: matched?.id ?? targetPlanId,
      isActivePaid: true,
      isPendingActivation: false,
    }
  }

  if (PENDING_CHECKOUT_STATUSES.includes(status)) {
    return {
      choosablePlanId: matched?.id ?? targetPlanId,
      isActivePaid: false,
      isPendingActivation: true,
    }
  }

  return {
    choosablePlanId: matched?.id ?? freePlanId,
    isActivePaid: false,
    isPendingActivation: false,
  }
}

/**
 * Returns true if this plan reflects the user's current resolved entitlement.
 * A null `choosablePlanId` (plans not yet loaded) never matches any plan.
 */
export function planMatchesSubscription(
  plan: ChoosablePlan,
  resolution: CurrentPlanResolution,
): boolean {
  if (resolution.choosablePlanId === null) return false
  return plan.id === resolution.choosablePlanId
}
