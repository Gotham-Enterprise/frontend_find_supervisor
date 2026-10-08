/**
 * Supervisor payout account (Stripe Connect Express) status.
 *
 * - not_started: no payout account yet
 * - incomplete: onboarding started but not finished
 * - action_required: Stripe needs more information
 * - pending: details submitted, Stripe is verifying
 * - ready: can receive supervisee payments
 */
export type PayoutAccountStatus =
  | 'not_started'
  | 'incomplete'
  | 'action_required'
  | 'pending'
  | 'ready'

export interface PayoutStatus {
  status: PayoutAccountStatus
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirementsDueCount: number
  disabledReason: string | null
}

export interface StripeLink {
  url: string
}
