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

/**
 * A supervisor's request to add a session to a closed week. Listed under the
 * week until Gotham support adds it (it then appears as a SUPPORT session) or
 * dismisses it. Never counts toward hours or money.
 */
export interface LateEntryRequest {
  id: string
  /** Eastern calendar date, YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  notes: string
  status: 'REQUESTED' | 'DISMISSED'
  createdAt: string
  resolvedAt: string | null
  /** Why support didn't add it */
  resolutionNote: string | null
}

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

/** An image the supervisee attached as evidence when disputing the week. */
export interface DisputeAttachment {
  id: string
  url: string
  fileName: string
  contentType: string
  sizeBytes: number
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
  disputeAttachments: DisputeAttachment[]
  canEditSessions: boolean
  canReview: boolean
  payment: SuperviseeWeekPayment | SupervisorWeekPayment | null
  sessions: HireSession[]
  /** Supervisor only; empty for the supervisee */
  lateEntryRequests: LateEntryRequest[]
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

/** GET /supervision/payments/earnings/week — one week across the supervisor's hires. */
export interface WeekSummaryDay {
  minutes: number
  /** Part of `minutes` that support added as late entries */
  lateMinutes: number
}

export interface WeekSummaryRow {
  weekId: string
  hireId: string
  superviseeName: string | null
  /** Supervisor's list page with this hire's sessions modal open */
  sessionsPath: string
  status: BillingWeekStatus
  prepayStatus: PrepayStatus
  /** Monday … Sunday */
  days: WeekSummaryDay[]
  minutes: number
  billedMinutes: number
  weeklyCapMinutes: number
  sessions: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  estimated: boolean
}

export interface SupervisorWeekSummary {
  /** Monday, YYYY-MM-DD (Eastern) */
  startDate: string
  /** Sunday, YYYY-MM-DD (Eastern) */
  endDate: string
  isCurrentWeek: boolean
  hasPrevious: boolean
  hasNext: boolean
  totals: {
    minutes: number
    sessions: number
    supervisees: number
    grossCents: number
    platformFeeCents: number
    netCents: number
    estimated: boolean
  }
  rows: WeekSummaryRow[]
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

/** A late entry on a settled week, charged and paid out on its own. */
export interface EarningsLateEntry {
  id: string
  /** YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  chargeStatus: PrepayStatus
  paidAt: string | null
  stripeTransferId: string | null
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
  approvedBy: BillingWeekApprovedBy | null
  paidOutCents: number
  /** Estimate for a prepaid week still in progress */
  pendingCents: number
  settledAt: string | null
  // Breakdown: the paid (or, until settled, logged) hours at the rate, less the platform fee
  hourlyRateCents: number
  platformFeeBps: number
  billedMinutes: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  /** True until the week settles */
  estimated: boolean
  lateEntries: EarningsLateEntry[]
  // Timeline
  prepaidAt: string | null
  prepayFailureMessage: string | null
  logDeadlineAt: string
  reviewEndsAt: string
  approvedAt: string | null
  disputedAt: string | null
  stripeTransferId: string | null
}

export interface EarningsSuperviseeSummary {
  hireId: string
  superviseeName: string | null
  paidOutCents: number
  pendingCents: number
  weeks: number
  /** Paid (or logged, until settled) minutes across the weeks */
  minutes: number
}

export interface EarningsMonth {
  /** YYYY-MM (US Eastern) */
  month: string
  paidOutCents: number
  minutes: number
  weeks: number
}

export interface SupervisorEarnings {
  totals: { paidOutCents: number; pendingCents: number; paidOutThisMonthCents: number }
  totalCount: number
  page: number
  limit: number
  /** Across all hires, regardless of the hire filter */
  bySupervisee: EarningsSuperviseeSummary[]
  /** Newest month first */
  monthly: EarningsMonth[]
  items: EarningsWeek[]
}
