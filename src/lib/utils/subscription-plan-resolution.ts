import { isFreePlan } from '@/lib/constants/subscription-plans'
import type { ChoosablePlan, Subscription, SubscriptionStatus } from '@/types/supervisor-profile'

/** Paid access is considered active for these statuses. */
const ACTIVE_PAID_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE']

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

/** True when the subscription row is the free tier (handles partial API payloads without plan.id). */
function subscriptionRowLooksFree(subscription: Subscription): boolean {
  const p = subscription.plan
  if (!p) return false
  if (typeof p.priceInCents === 'number' && p.priceInCents === 0) return true
  return isFreePlan(p)
}

/**
 * Maps the user's free subscription to a catalog plan id so the modal can highlight
 * "Your current plan" even when `planId` / `plan.id` are omitted from the API.
 */
function resolveFreeCatalogPlanId(
  subscription: Subscription,
  plans: ChoosablePlan[],
): string | null {
  const targetPlanId = subscription.planId ?? subscription.plan.id
  const name = subscription.plan.name?.trim()

  if (targetPlanId) {
    const byId = plans.find((p) => p.id === targetPlanId && isFreePlan(p))
    if (byId) return byId.id
  }

  if (name) {
    const byName = plans.find((p) => isFreePlan(p) && p.name?.trim() === name)
    if (byName) return byName.id
  }

  return plans.find(isFreePlan)?.id ?? null
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
    if (subscriptionRowLooksFree(subscription)) {
      const resolvedFreeId = resolveFreeCatalogPlanId(subscription, plans) ?? freePlanId
      return {
        choosablePlanId: resolvedFreeId,
        isActivePaid: false,
        isPendingActivation: false,
      }
    }

    return {
      choosablePlanId: matched?.id ?? targetPlanId ?? freePlanId,
      isActivePaid: true,
      isPendingActivation: false,
    }
  }

  if (PENDING_CHECKOUT_STATUSES.includes(status)) {
    if (subscriptionRowLooksFree(subscription)) {
      return {
        choosablePlanId: resolveFreeCatalogPlanId(subscription, plans) ?? freePlanId,
        isActivePaid: false,
        isPendingActivation: true,
      }
    }
    // Paid plan row but checkout not finished — entitlement is still the free tier until webhook activates.
    return {
      choosablePlanId: freePlanId,
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
  if (resolution.choosablePlanId == null) return false
  return plan.id === resolution.choosablePlanId
}
