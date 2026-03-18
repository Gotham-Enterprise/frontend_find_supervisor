export interface SupervisorSearchFilters {
  keyword: string
  stateLicenses: string[]
  cities: string[]
  states: string[]
  formatVirtual: boolean
  formatInPerson: boolean
  formatHybrid: boolean
  yearsOfExperience: string
  patientPopulation: string[]
  acceptingOnly: boolean
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
