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
  /** Pilot allowlist: only these supervisors propose hourly, in-app billed agreements. */
  inAppPaymentsPilot: boolean
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
 * Hourly terms breakdown (integer cents). Each billing week the supervisee
 * prepays `weeklyTotalCents` (weekly cap at the hourly rate + service fee);
 * after the review the supervisor receives approved hours × rate minus the
 * platform fee, and the unused prepay is refunded (the service fee is not).
 */
export interface HourlyQuote {
  hourlyRateCents: number
  weeklyCapMinutes: number
  platformFeeBps: number
  weeklyPrepayCents: number
  serviceFeeCents: number
  weeklyTotalCents: number
  hourlyPlatformFeeCents: number
  supervisorHourlyCents: number
  supervisorWeeklyMaxCents: number
}

export type HirePaymentStatus =
  | 'not_applicable'
  | 'awaiting_signature'
  | 'awaiting_card'
  | 'card_saved'

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
  quote: HourlyQuote | null
  /** When the first week's prepay is charged: the start date, or now if that has passed. */
  firstPrepayAt: string | null
  supervisorPayoutsReady: boolean
  /** The card the weekly prepays are charged to (supervisee only). */
  card: SavedCard | null
  /** Only populated for the supervisee (payer). */
  savedCards: SavedCard[]
}
