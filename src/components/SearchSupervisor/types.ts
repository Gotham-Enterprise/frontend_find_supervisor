export interface SupervisorSearchFilters {
  /** Supervisor type names from GET /api/supervision/supervisor-type */
  supervisorTypes: string[]
  /** Occupation names — cascades from selected supervisorTypes */
  supervisorOccupations: string[]
  /** Specialty names — cascades from selected supervisorOccupations */
  supervisorSpecialties: string[]
  /** License type names — sourced from the supervisor-type hierarchy */
  licenseTypes: string[]
  stateLicenses: string[]
  /** Single city value for location search (matches city option `value`). */
  city: string
  /** US state code for location search (matches state option `value`). */
  state: string
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
