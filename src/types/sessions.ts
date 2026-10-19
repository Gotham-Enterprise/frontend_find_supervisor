/**
 * Billing week of an hourly hire (Mon–Sun, US Eastern):
 * - OPEN: the supervisor can log sessions until the Monday 11:59 PM ET deadline
 * - IN_REVIEW: the supervisee approves or disputes within 3 days
 * - DISPUTED: frozen until Gotham support resolves it
 * - APPROVED: by the supervisee, automatically, or by support
 * - SETTLED: supervisor paid, unused prepay refunded
 */
export type BillingWeekStatus = 'OPEN' | 'IN_REVIEW' | 'DISPUTED' | 'APPROVED' | 'SETTLED'

export type BillingWeekApprovedBy = 'SUPERVISEE' | 'AUTO' | 'SUPPORT'

export interface HireSession {
  id: string
  /** Eastern calendar date, YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  notes: string | null
  /** SUPPORT = late entry added by Gotham support */
  source: 'SUPERVISOR' | 'SUPPORT'
  createdAt: string
  /** Late entries only: the supervisee approves or rejects them. */
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  canRespond: boolean
  /** Late entries on a settled week are charged on their own. */
  chargeStatus: PrepayStatus | null
  /** Supervisee: what that charge is; supervisor: what they're paid for it. */
  lateChargeCents: number | null
}

export type PrepayStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'

/** The week's money, as each side sees it. */
interface BillingWeekPaymentBase {
  prepayStatus: PrepayStatus
  /** Eastern YYYY-MM-DD the prepay is charged: the week's Monday, or the agreement start if later. */
  prepayDueDate: string
  paidAt: string | null
  settledAt: string | null
  /** Due but not paid (declined, or no card yet) — sessions can still be logged. */
  unpaid: boolean
}

export interface SuperviseeWeekPayment extends BillingWeekPaymentBase {
  /** Weekly cap at the hourly rate + service fee */
  totalCents: number
  failureMessage: string | null
  /** Unused prepay refunded after the review */
  refundCents: number | null
  canPayNow: boolean
}

export interface SupervisorWeekPayment extends BillingWeekPaymentBase {
  /** Paid out for the approved hours, after the platform fee */
  supervisorAmountCents: number | null
}

export interface BillingWeek {
  id: string
  /** Monday, YYYY-MM-DD (Eastern) */
  startDate: string
  /** Sunday, YYYY-MM-DD (Eastern) */
  endDate: string
  status: BillingWeekStatus
  prepayStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'
  weeklyCapMinutes: number
  loggedMinutes: number
  logDeadlineAt: string
  reviewEndsAt: string
  approvedMinutes: number | null
  approvedAt: string | null
  approvedBy: BillingWeekApprovedBy | null
  disputedAt: string | null
  disputeReason: string | null
  canEditSessions: boolean
  canReview: boolean
  payment: SuperviseeWeekPayment | SupervisorWeekPayment | null
  sessions: HireSession[]
}

/** GET /supervision/hires/:hireId/billing-weeks */
export interface HireBillingWeeks {
  role: 'supervisor' | 'supervisee'
  /**
   * Whether the weekly prepays have a card to charge. Until the supervisee saves
   * one, no billing weeks are created and the supervisor can't log sessions.
   */
  hasPaymentCard: boolean | null
  /** Money so far: the supervisee's net payments, or the supervisor's payouts (cents). */
  totals:
    | { chargedCents: number; refundedCents: number; netPaidCents: number }
    | { paidOutCents: number }
  terms: {
    /** YYYY-MM-DD */
    startDate: string
    hourlyRateCents: number
    weeklyCapMinutes: number
    totalHours: number | null
  }
  progress: {
    loggedMinutes: number
    approvedMinutes: number
    totalMinutes: number | null
  }
  canLog: boolean
  /** Dates (YYYY-MM-DD, Eastern) the supervisor can log for right now. */
  loggable: { from: string; to: string } | null
  /** Newest first */
  weeks: BillingWeek[]
}

export interface HireSessionInput {
  sessionDate: string
  durationMinutes: number
  notes: string
}

/** POST /supervision/hires/:hireId/billing-weeks/:weekId/pay-now */
export interface PayNowIntent {
  status: string
  /** Absent when the week is already paid. */
  clientSecret?: string
  paymentMethodId?: string
}

/** GET /supervision/payments/earnings — a supervisor's in-app earnings across hires. */
export interface EarningsWeek {
  id: string
  hireId: string
  superviseeName: string | null
  startDate: string
  endDate: string
  status: BillingWeekStatus
  prepayStatus: PrepayStatus
  /** Logged (not rejected) minutes */
  minutes: number
  approvedMinutes: number | null
  paidOutCents: number
  /** Estimate for a prepaid week still in progress */
  pendingCents: number
  settledAt: string | null
}

export interface SupervisorEarnings {
  totals: { paidOutCents: number; pendingCents: number }
  totalCount: number
  page: number
  limit: number
  items: EarningsWeek[]
}
