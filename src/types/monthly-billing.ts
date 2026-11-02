import type { SavedCard } from './payouts'

/** In-app monthly billing (Medical Director retainers). All money in integer cents. */

/** GET /supervision/payments/monthly-quote — what one month costs and pays out. */
export interface MonthlyQuote {
  monthlyAmountCents: number
  /** Supervisor only. */
  platformFeeBps?: number
  serviceFeeCents: number
  monthlyTotalCents: number
  /** Supervisor only. */
  platformFeeCents?: number
  /** Supervisor only. */
  supervisorMonthlyCents?: number
}

export type MonthlyPeriodStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'DISPUTED'
  | 'APPROVED'
  | 'SETTLED'
  | 'CANCELED'

export type MonthlyPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'

/** One month of a monthly hire, as the supervisee or supervisor sees it. */
export interface MonthlyPeriod {
  id: string
  periodIndex: number
  /** Eastern YYYY-MM-DD, first and last day of the month. */
  startDate: string
  endDate: string
  label: string
  status: MonthlyPeriodStatus
  paymentStatus: MonthlyPaymentStatus
  amountCents: number
  paidAt: string | null
  failureMessage: string | null
  /** Unpaid months: pay by then, or the Medical Director may end the supervision. */
  graceEndsAt: string | null
  /** The payment is released to the Medical Director after this (unless disputed). */
  reviewEndsAt: string
  disputedAt: string | null
  disputeReason: string | null
  resolvedAt: string | null
  resolutionNote: string | null
  approvedAmountCents: number | null
  approvedBy: 'SUPERVISEE' | 'AUTO' | 'SUPPORT' | null
  settledAt: string | null
  refundCents: number
  isCurrent: boolean
  // supervisee
  serviceFeeCents?: number
  totalCents?: number
  canPayNow?: boolean
  canDispute?: boolean
  canApprove?: boolean
  // supervisor
  platformFeeCents?: number
  supervisorAmountCents?: number
}

export interface MonthlyScheduledEnd {
  endsAt: string
  /** Eastern YYYY-MM-DD: the last day of supervision. */
  lastDay: string
  status: 'COMPLETED' | 'CANCELED'
  by: 'SUPERVISOR' | 'SUPERVISEE' | 'TERM'
  reason: string | null
}

/** GET /supervision/hires/:hireId/monthly-billing */
export interface HireMonthlyBilling {
  role: 'supervisor' | 'supervisee'
  hireStatus: string
  paymentStatus: 'awaiting_card' | 'card_saved'
  signed: boolean
  terms: {
    startDate: string
    monthlyAmountCents: number
    /** null = month to month until ended. */
    supervisionMonths: number | null
    platformFeeBps?: number
  }
  quote: MonthlyQuote
  /** Eastern YYYY-MM-DD */
  firstChargeDate: string
  nextChargeDate: string | null
  supervisorPayoutsReady: boolean
  card: SavedCard | null
  savedCards: SavedCard[]
  scheduledEnd: MonthlyScheduledEnd | null
  unpaid: { periodId: string; graceEndsAt: string | null; graceOver: boolean } | null
  canEndForNonPayment: boolean
  periods: MonthlyPeriod[]
}

/** GET /supervision/payments/monthly — months across hires (Billing page). */
export interface MonthlyPaymentsPage {
  totals: {
    // supervisor
    paidOutCents?: number
    pendingCents?: number
    // supervisee
    chargedCents?: number
    refundedCents?: number
  }
  page: number
  limit: number
  total: number
  periods: (MonthlyPeriod & {
    hireId: string
    counterpartName: string | null
    billingPath: string
  })[]
}
