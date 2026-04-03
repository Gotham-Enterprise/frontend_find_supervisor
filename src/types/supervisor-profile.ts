export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type VisibilityStatus = 'HIDDEN' | 'VISIBLE'
export type SupervisionFormat = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'
export type SubscriptionStatus =
  | 'INACTIVE'
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'

/** Paid plans from GET /supervision/plans (and nested on Subscription). */
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string | null
  priceInCents: number
  billingCycle: string | null
  transactionFeePct?: number | null
  durationMonths?: number | null
  isActive: boolean
  stripePriceId?: string | null
  stripeProductId?: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Free tier (frontend-only `free-plan` id) or a paid API plan for the plan picker.
 */
export type ChoosablePlan =
  | (SubscriptionPlan & { isFree?: false })
  | {
      id: 'free-plan'
      name: string
      description?: string | null
      priceInCents: 0
      billingCycle: null
      isActive: true
      isFree: true
      stripePriceId?: undefined
      stripeProductId?: undefined
    }

/**
 * Response from POST /supervision/payments/purchase-subscription.
 *
 * Backend contract:
 *  - Creates a Stripe Subscription with payment_behavior: "default_incomplete"
 *  - Expands latest_invoice.confirmation_secret to get the client_secret
 *  - Returns clientSecret for the frontend to call stripe.confirmPayment()
 *  - Subscription status stays INACTIVE until the Stripe webhook fires
 */
export interface PurchaseSubscriptionResponse {
  subscriptionId: string
  stripeSubscriptionId: string
  customerId: string
  /** Payment intent client_secret — pass to stripe.confirmPayment(). */
  clientSecret: string
  plan: {
    id: string
    name: string
    billingCycle: string | null
    priceInCents: number
  }
}

/** GET /supervision/payments/current-subscription — latest row for user, `data` may be null. */
export interface Subscription {
  id: string
  planId?: string
  status: SubscriptionStatus
  stripeSubscriptionId?: string | null
  stripeCustomerId?: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd?: boolean
  createdAt?: string
  updatedAt?: string
  plan: SubscriptionPlan
}

export interface SupervisorProfileUser {
  id: string
  email: string
  userName?: string
  role?: string
  firstName?: string | null
  lastName?: string | null
  fullName: string | null
  contactNumber?: string | null
  city: string | null
  state: string | null
  zipcode?: string | null
  profilePhotoUrl: string | null
  emailVerified: boolean
  status?: string
  subscriptions: Subscription[]
  /** Fetched via user relation, not SupervisorProfile */
  occupation?: { id: number; name: string } | null
  specialty?: { id: number; name: string } | null
}

export interface SupervisorProfileData {
  id: string
  userId: string

  licenseType: string | null
  profession: string | null
  professionOther?: string | null
  licenseNumber: string | null
  stateLicense: string | null
  licenseExpiration?: string | null

  yearsOfExperience: string | null
  npiNumber?: string | null
  certification?: string[]
  patientPopulation?: string[]
  supervisionFormat: SupervisionFormat | null
  availability: string | null
  acceptingSupervisees: boolean
  describeYourself?: string | null

  supervisionFeeType: string | null
  /** Fee stored in cents, e.g. 11000 = $110 */
  supervisionFeeAmount: number | null
  professionalSummary?: string | null
  website?: string | null

  verificationStatus: VerificationStatus
  verificationNotes?: string | null
  visibilityStatus: VisibilityStatus
  totalCompletedSupervision?: number

  createdAt: string
  updatedAt: string

  user: SupervisorProfileUser
}
