import type { Subscription, SupervisorOccupation, SupervisorSpecialty } from './supervisor-profile'

export type { Subscription }

export type SupervisionFormat = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'

export type LookingTimeline =
  | 'IMMEDIATELY'
  | 'WITHIN_1_MONTH'
  | 'WITHIN_2_MONTHS'
  | 'WITHIN_6_MONTHS'

export type BudgetRangeType = 'PER_SESSION' | 'MONTHLY'

export interface SuperviseeProfileUser {
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
  occupationId?: number | null
  specialtyId?: number | null
}

export interface SuperviseeProfileData {
  id: string
  userId: string

  /** Type of supervisor the supervisee is looking for */
  typeOfSupervisorNeeded: string | null
  /** How soon they need to start supervision */
  howSoonLooking: LookingTimeline | null
  lookingDate: string | null
  /** Preferred supervision delivery format */
  preferredFormat: SupervisionFormat | null
  availability: string | null
  /** Free-text description of their ideal supervisor / about them */
  idealSupervisor: string | null
  /** State the supervisee is seeking supervision in */
  stateTheyAreLookingIn: string | null

  budgetRangeType: BudgetRangeType | null
  /** Budget lower bound in whole dollars */
  budgetRangeStart: number | null
  /** Budget upper bound in whole dollars */
  budgetRangeEnd: number | null

  /** Number of completed supervision sessions */
  completedCount: number
  /** Number of remaining required supervision hours/sessions */
  leftCount: number

  createdAt: string
  updatedAt: string

  /** Occupation joined from user relation */
  occupation?: SupervisorOccupation | null
  occupationId?: number | null
  /** Specialty joined from user relation */
  specialty?: SupervisorSpecialty | null
  specialtyId?: number | null

  user: SuperviseeProfileUser
}
