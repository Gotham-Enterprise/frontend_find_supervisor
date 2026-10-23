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

/** Where payouts land; read live from Stripe, never stored by the platform. */
export interface PayoutBankAccount {
  bankName: string | null
  last4: string | null
  currency: string
}

export interface PayoutSchedule {
  interval: 'manual' | 'daily' | 'weekly' | 'monthly'
  delayDays: number | null
  weeklyAnchor: string | null
  monthlyAnchor: number | null
}

export interface PayoutBalance {
  availableCents: number
  pendingCents: number
}

export interface StripePayout {
  id: string
  amountCents: number
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed'
  arrivalDate: string
  createdAt: string
}

/** Why the payout account can't be removed yet (GET /connect/removal-check). */
export type PayoutRemovalBlocker =
  | { code: 'active_hourly_hires' | 'unsettled_weeks' | 'unpaid_late_sessions'; count: number }
  | { code: 'stripe_balance'; amountCents: number }

export interface PayoutRemovalCheck {
  canRemove: boolean
  blockers: PayoutRemovalBlocker[]
}

export interface PayoutStatus {
  status: PayoutAccountStatus
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirementsDueCount: number
  disabledReason: string | null
  /** The following are populated only when status is 'ready'; each is null on a Stripe lookup failure. */
  bankAccount: PayoutBankAccount | null
  payoutSchedule: PayoutSchedule | null
  balance: PayoutBalance | null
  nextPayout: StripePayout | null
  lastPayout: StripePayout | null
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

/** Hourly agreements: the card is saved before signing, so there is no "awaiting signature" state. */
export type HirePaymentStatus = 'not_applicable' | 'awaiting_card' | 'card_saved'

export interface SavedCard {
  id: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
}

/** GET /supervision/payments/cards — the supervisee's saved cards (Billing page). */
export interface SuperviseeSavedCard extends SavedCard {
  /** Active hires whose weekly prepays are charged to this card; non-empty = can't remove. */
  inUseBy: { hireId: string; supervisorName: string | null }[]
}

export interface SuperviseeCards {
  cards: SuperviseeSavedCard[]
}

/** A late session on a settled week, charged to the supervisee on its own. */
export interface SuperviseeLateCharge {
  id: string
  /** YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  totalCents: number
  chargeStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'
  paidAt: string | null
}

/** One billing week as the supervisee paid for it (integer cents). */
export interface SuperviseePaymentWeek {
  id: string
  hireId: string
  supervisorName: string | null
  /** Supervisee's list page with this hire's sessions modal open */
  sessionsPath: string
  startDate: string
  endDate: string
  status: 'OPEN' | 'IN_REVIEW' | 'DISPUTED' | 'APPROVED' | 'SETTLED'
  prepayStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'
  /** Prepay (cap + service fee) plus any charged late sessions. */
  chargedCents: number
  serviceFeeCents: number
  refundCents: number | null
  approvedMinutes: number | null
  approvedBy: 'SUPERVISEE' | 'AUTO' | 'SUPPORT' | null
  failureMessage: string | null
  paidAt: string | null
  settledAt: string | null
  // Breakdown: the prepay, what the (approved or, until then, logged) hours cost, the refund
  hourlyRateCents: number
  weeklyCapMinutes: number
  loggedMinutes: number
  billedMinutes: number
  prepayAmountCents: number
  totalCents: number
  hoursChargeCents: number
  /** Actual once settled, otherwise what the logged hours would leave unused */
  expectedRefundCents: number
  /** Hours + service fee + late sessions: what the week costs in the end */
  costCents: number
  /** True until the week settles */
  estimated: boolean
  lateEntries: SuperviseeLateCharge[]
  // Timeline + actions
  prepayDueDate: string
  logDeadlineAt: string
  reviewEndsAt: string
  approvedAt: string | null
  disputedAt: string | null
  failedAt: string | null
  hasReceipt: boolean
  canReview: boolean
  canPayNow: boolean
}

/** GET /supervision/payments/history */
export interface SuperviseePayments {
  totals: {
    chargedCents: number
    refundedCents: number
    netPaidCents: number
    chargedThisMonthCents: number
    refundedThisMonthCents: number
  }
  totalCount: number
  page: number
  limit: number
  items: SuperviseePaymentWeek[]
}

/** GET /supervision/payments/history/week — one week across the supervisee's hires. */
export interface SuperviseeWeekRow extends SuperviseePaymentWeek {
  weekId: string
  /** Monday … Sunday */
  days: { minutes: number; lateMinutes: number }[]
  minutes: number
  sessions: number
}

export interface SuperviseeWeekSummary {
  startDate: string
  endDate: string
  isCurrentWeek: boolean
  hasPrevious: boolean
  hasNext: boolean
  totals: {
    minutes: number
    sessions: number
    supervisors: number
    prepaidCents: number
    hoursChargeCents: number
    expectedRefundCents: number
    costCents: number
    estimated: boolean
    needsReview: number
    unpaid: number
  }
  rows: SuperviseeWeekRow[]
}

/** GET /supervision/hires/:hireId/payment */
export interface HirePaymentInfo {
  paymentStatus: HirePaymentStatus
  quote: HourlyQuote | null
  /** Eastern YYYY-MM-DD the first prepay is charged: the start date, or today if that has passed. */
  firstPrepayDate: string | null
  supervisorPayoutsReady: boolean
  /** The card the weekly prepays are charged to (supervisee only). */
  card: SavedCard | null
  /** Only populated for the supervisee (payer). */
  savedCards: SavedCard[]
}
