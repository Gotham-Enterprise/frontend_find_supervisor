import { FREE_PLAN_ID } from '@/lib/constants/subscription-plans'
import type { ChoosablePlan, Subscription, SubscriptionStatus } from '@/types/supervisor-profile'

/** Paid access is considered active for these statuses. */
const ACTIVE_PAID_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE']

/** Checkout started but payment not completed (Stripe subscription still incomplete). */
const PENDING_CHECKOUT_STATUSES: SubscriptionStatus[] = ['INACTIVE']

/** No longer entitled to paid tier — treat as free for “current plan” UI. */
const NON_ENTITLED_STATUSES: SubscriptionStatus[] = ['CANCELED', 'UNPAID']

export type CurrentPlanResolution = {
  /** Which choosable plan id reflects the user’s subscription (or Free). */
  choosablePlanId: string
  /** User has an active paid subscription on that plan. */
  isActivePaid: boolean
  /** Subscription exists but payment / activation not finished. */
  isPendingActivation: boolean
}

function paidPlanIds(mergedPlans: ChoosablePlan[]): ChoosablePlan[] {
  return mergedPlans.filter((p) => p.id !== FREE_PLAN_ID)
}

/**
 * Maps API subscription + merged modal plans to the stable id used in the plan picker.
 * Prefers `plan.id` / `planId`, then Stripe price id match.
 */
export function resolveCurrentChoosablePlan(
  subscription: Subscription | null | undefined,
  mergedPlans: ChoosablePlan[],
): CurrentPlanResolution {
  if (!subscription?.plan) {
    return {
      choosablePlanId: FREE_PLAN_ID,
      isActivePaid: false,
      isPendingActivation: false,
    }
  }

  const { status, plan } = subscription
  const targetPlanId = subscription.planId ?? plan.id

  const matchById = paidPlanIds(mergedPlans).find((p) => p.id === targetPlanId)
  const matchByStripe =
    !matchById && plan.stripePriceId
      ? paidPlanIds(mergedPlans).find((p) => p.stripePriceId === plan.stripePriceId)
      : undefined
  const matchByProduct =
    !matchById && !matchByStripe && plan.stripeProductId
      ? paidPlanIds(mergedPlans).find((p) => p.stripeProductId === plan.stripeProductId)
      : undefined

  const matched = matchById ?? matchByStripe ?? matchByProduct

  if (NON_ENTITLED_STATUSES.includes(status)) {
    return {
      choosablePlanId: FREE_PLAN_ID,
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
    choosablePlanId: matched?.id ?? FREE_PLAN_ID,
    isActivePaid: false,
    isPendingActivation: false,
  }
}

export function planMatchesSubscription(
  plan: ChoosablePlan,
  resolution: CurrentPlanResolution,
): boolean {
  if (plan.id === FREE_PLAN_ID) {
    return resolution.choosablePlanId === FREE_PLAN_ID && !resolution.isPendingActivation
  }
  return plan.id === resolution.choosablePlanId
}
