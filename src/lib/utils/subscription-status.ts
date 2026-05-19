import type { Subscription, SubscriptionStatus } from '@/types/supervisor-profile'

const SCHEDULED_CANCEL_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE']

/** Subscription is still entitled but set to end at the current period (Stripe cancel_at_period_end). */
export function isSubscriptionScheduledForCancellation(sub: Subscription): boolean {
  return !!sub.cancelAtPeriodEnd && SCHEDULED_CANCEL_STATUSES.includes(sub.status)
}

/** User can call POST reactivate-subscription (undo scheduled cancellation). */
export function canResumeSubscription(sub: Subscription): boolean {
  return isSubscriptionScheduledForCancellation(sub) && !!sub.stripeSubscriptionId
}

/** Profile/dashboard fields when full Subscription object is unavailable. */
export function isSubscriptionScheduledForCancellationFields(
  status: SubscriptionStatus | null | undefined,
  cancelAtPeriodEnd?: boolean | null,
): boolean {
  if (!status || !cancelAtPeriodEnd) return false
  return SCHEDULED_CANCEL_STATUSES.includes(status)
}
