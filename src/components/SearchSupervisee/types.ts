import type { SupervisionFormat } from '@/types/supervisee-profile'

export interface SuperviseeSearchFilters {
  /** US state codes — matches supervisee stateTheyAreLookingIn */
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
  occupation: string
  specialty: string
  city: string
  state: string
  location: string
  preferredFormat: SupervisionFormat | ''
  howSoonLooking: string
  stateTheyAreLookingIn: string[]
  bio: string
  budgetRangeType: string
  budgetRangeStart: number | null
  budgetRangeEnd: number | null
  profilePhotoUrl?: string
  initials: string
  avatarColor: string
  hireStatusWithCurrentSupervisor: string
}

export type SortOption = 'best_match' | 'newest'
