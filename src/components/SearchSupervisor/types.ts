export interface SupervisorSearchFilters {
  /** Occupation ids from GET /api/categories/occupations */
  occupationIds: string[]
  /** Specialty ids from GET /api/categories/specialties/occupation/:id */
  specialtyIds: string[]
  /** Option values from GET /api/supervision/options?param=licenseType */
  licenseTypes: string[]
  stateLicenses: string[]
  cities: string[]
  states: string[]
  radiusMiles: number
  /** VIRTUAL | IN_PERSON | HYBRID */
  supervisionFormats: string[]
  /** Range keys, e.g. 0_1, 2_3 (see YEARS_OF_EXPERIENCE_OPTIONS) */
  yearsExperience: string[]
  patientPopulation: string[]
  acceptingOnly: boolean
  /** Option values from GET /api/supervision/options?param=availability */
  availability: string[]
}

export type SupervisionFormat = 'VIRTUAL' | 'IN_PERSON' | 'HYBRID'

export interface SupervisorSearchResult {
  id: string
  fullName: string
  credentials: string
  licenseType: string
  supervisorType: string
  yearsOfExperience: string
  city: string
  state: string
  location: string
  licenseNumber: string
  licenseState: string
  formats: SupervisionFormat[]
  accepting: boolean
  bio: string
  specialties: string[]
  patientPopulation: string[]
  profilePhotoUrl?: string
  initials: string
  avatarColor: string
}

export type SortOption = 'best_match' | 'most_reviewed' | 'experience_desc' | 'experience_asc'
