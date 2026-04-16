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

/** Plans from GET /supervision/plans — both free (priceInCents: 0) and paid. */
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string | null
  /** Feature bullet points returned by the API. */
  features?: string[] | null
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
 * All plans returned by GET /supervision/plans.
 * Both free (priceInCents === 0, stripePriceId === null) and paid plans are included.
 * Use {@link isFreePlan} / {@link canCheckoutPlan} from subscription-plans.ts to distinguish them.
 */
export type ChoosablePlan = SubscriptionPlan

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

export interface SupervisorOccupation {
  id: number
  name: string
  iconUrl?: string | null
}

export interface SupervisorSpecialty {
  id: number
  name: string
  occupationId?: number | null
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
  stateOfLicensure: string[]
  profilePhotoUrl: string | null
  emailVerified: boolean
  status?: string
  subscriptions: Subscription[]
  occupation?: SupervisorOccupation | null
  specialty?: SupervisorSpecialty | null
  createdAt?: string
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
  /** Fee in whole dollars, e.g. 100 = $100 */
  supervisionFeeAmount: number | null
  professionalSummary?: string | null
  website?: string | null

  licenseUrl?: string | null
  licenseObjectKey?: string | null
  licenseFileName?: string | null
  verificationDocumentUrl?: string | null

  verificationStatus: VerificationStatus
  verificationNotes?: string | null
  visibilityStatus: VisibilityStatus
  totalCompletedSupervision?: number

  /** Occupation from the profile join (same as user.occupation) */
  occupation?: SupervisorOccupation | null
  /** Specialty from the profile join (same as user.specialty) */
  specialty?: SupervisorSpecialty | null
  occupationId?: number | null
  specialtyId?: number | null

  createdAt: string
  updatedAt: string

  user: SupervisorProfileUser
}
