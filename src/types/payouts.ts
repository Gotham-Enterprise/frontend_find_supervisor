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

/**
 * Weekly charge breakdown (integer cents). The supervisee pays `totalCents`
 * (weekly rate + service fee); the supervisor receives `supervisorAmountCents`
 * (weekly rate − platform fee, ±1¢ from Stripe's percentage rounding).
 */
export interface WeeklyQuote {
  weeklyAmountCents: number
  serviceFeeCents: number
  totalCents: number
  platformFeeBps: number
  platformFeeCents: number
  supervisorAmountCents: number
  applicationFeePercent: number
}

export type HirePaymentStatus =
  | 'not_applicable'
  | 'awaiting_signature'
  | 'awaiting_payment'
  | 'processing'
  | 'scheduled'
  | 'active'

export interface SavedCard {
  id: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
}

/** GET /supervision/hires/:hireId/payment */
export interface HirePaymentInfo {
  paymentStatus: HirePaymentStatus
  quote: WeeklyQuote | null
  schedule: {
    billingStartsAt: string
    /** Set when the first charge waits for a future start date. */
    trialEndsAt: string | null
    endsAt: string
    durationWeeks: number
  } | null
  nextChargeAt: string | null
  supervisorPayoutsReady: boolean
  /** Only populated for the supervisee (payer). */
  savedCards: SavedCard[]
}
