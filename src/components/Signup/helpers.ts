import type { LicenseEntryValues, SuperviseeFormValues, SupervisorFormValues } from './schema'
import type { SignupRole } from './types'

export function parseSignupRoleFromType(type?: string | null): SignupRole {
  return type === 'supervisee' ? 'supervisee' : 'supervisor'
}

/** Blank license entry for field arrays ("Add another license" + defaults). */
export const emptyLicenseEntry: LicenseEntryValues = {
  licenseType: '',
  licenseNumber: '',
  state: '',
  licenseExpiration: '',
}

export const supervisorDefaultValues: Partial<SupervisorFormValues> = {
  fullName: '',
  professionalCredentials: '',
  email: '',
  password: '',
  confirmPassword: '',
  contactNumber: '',
  city: '',
  state: '',
  zipcode: '',
  supervisorType: '',
  supervisorOccupationId: '',
  supervisorSpecialtyId: '',
  degreeType: '',
  licenses: [{ ...emptyLicenseEntry }],
  npiNumber: '',
  certifications: [],
  yearsOfExperience: '',
  patientPopulation: [],
  supervisionFormat: 'virtual',
  availability: '',
  acceptingNewSupervisees: true,
  professionalSummary: '',
  describeYourself: '',
  supervisionFeeType: 'HOURLY',
  supervisionFeeAmount: undefined,
  website: '',
  agreedToPost: false,
  agreedToTerms: false,
}

export const superviseeDefaultValues: Partial<SuperviseeFormValues> = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  contactNumber: '',
  city: '',
  state: '',
  zipcode: '',
  typeOfSupervisor: '',
  needsMedicalDirector: false,
  supervisorOccupationId: '',
  supervisorSpecialtyId: '',
  stateOfLicensure: [],
  stateTheyAreLookingIn: [],
  howSoon: '',
  howSoonDate: '',
  preferredFormat: 'virtual',
  feeType: 'per-session',
  budgetRange: '',
  availability: '',
  title: '',
  occupationId: '',
  specialtyId: '',
  description: '',
  agreedToPost: false,
  agreedToTerms: false,
}
