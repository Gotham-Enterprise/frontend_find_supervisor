import type { SupervisionFormat } from '@/types/supervisee-profile'

export interface SuperviseeSearchFilters {
  /** US state codes — matches the supervisee's states of licensure */
  states: string[]
  /** Occupation names from GET /api/categories/occupations */
  occupations: string[]
  /** Specialty names — cascades from selected occupations */
  specialties: string[]
}

export type { SupervisionFormat }

export interface SuperviseeSearchResult {
  id: string
  fullName: string
  title: string
  /** State tied to the credential/title (US state abbreviation, e.g. "TX") */
  licensureState: string
  occupation: string
  specialty: string
  city: string
  state: string
  location: string
  preferredFormat: SupervisionFormat | ''
  howSoonLooking: string
  bio: string
  budgetRangeType: string
  budgetRangeStart: number | null
  budgetRangeEnd: number | null
  /** Roles they're looking for (supervision types + "Medical Director") */
  typeOfSupervisorNeeded: string[]
  mdHowSoonLooking: string
  mdMonthlyBudget: number | null
  profilePhotoUrl?: string
  initials: string
  avatarColor: string
  hireStatusWithCurrentSupervisor: string
  isConnectedWithCurrentSupervisor: boolean
}

export type SortOption = 'best_match' | 'newest'
