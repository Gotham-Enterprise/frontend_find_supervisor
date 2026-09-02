import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

import type {
  BoardCertificationEntryValues,
  LicenseEntryValues,
  MedicalDirectorFormValues,
  OfferingCredentialsValues,
  SuperviseeFormValues,
  SupervisorFormValues,
} from './schema'
import type { SignupRole } from './types'

export function parseSignupRoleFromType(type?: string | null): SignupRole {
  if (type === 'supervisee') return 'supervisee'
  if (type === 'medical-director') return 'medical-director'
  if (type === 'need-medical-director') return 'need-medical-director'
  return 'supervisor'
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

/** Blank offering credentials block ("Offer as …" checkboxes start unchecked). */
export const emptyOfferingCredentials = (): OfferingCredentialsValues => ({
  occupation: '',
  specialty: '',
  degreeType: '',
  licenses: [{ ...emptyLicenseEntry }],
})

/** Blank board-certification entry ("Board Certified?" starts as No). */
export const emptyBoardCertification = (): BoardCertificationEntryValues => ({
  certifyingBoard: '',
  certifyingBoardOther: '',
  specialty: '',
  subspecialty: '',
  certificationNumber: '',
  expirationDate: '',
})

/**
 * Superset defaults shared by both SupervisorSignupForm variants — the form is
 * typed as MedicalDirectorFormValues, so the plain supervisor variant also
 * carries (and ignores) the offering keys.
 */
export const supervisorSignupDefaultValues: Partial<MedicalDirectorFormValues> = {
  ...supervisorDefaultValues,
  offerSupervisingPhysician: false,
  offerCollaboratingPhysician: false,
  offerings: {
    supervising: emptyOfferingCredentials(),
    collaborating: emptyOfferingCredentials(),
  },
  boardCertified: false,
  boardCertifications: [emptyBoardCertification()],
}

export const medicalDirectorDefaultValues: Partial<MedicalDirectorFormValues> = {
  ...supervisorSignupDefaultValues,
  // Preset — the Medical Director flow renders no Supervisor Type select.
  supervisorType: MEDICAL_DIRECTOR_TYPE_NAME,
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
  howSoon: '',
  howSoonDate: '',
  mdPreferredOccupationId: '',
  mdPreferredSpecialtyId: '',
  mdHowSoon: '',
  mdHowSoonDate: '',
  mdMonthlyBudget: undefined,
  mdIdealDescription: '',
  introduction: '',
  preferredFormat: 'virtual',
  feeType: 'hourly',
  budgetRange: '',
  monthlyBudget: undefined,
  availability: '',
  title: '',
  licensureState: '',
  occupationId: '',
  specialtyId: '',
  description: '',
  agreedToPost: false,
  agreedToTerms: false,
}

export const needMedicalDirectorDefaultValues: Partial<SuperviseeFormValues> = {
  ...superviseeDefaultValues,
  // Preset — the "I need a Medical Director" flow renders no supervision-type
  // select or checkbox; the payload builder sends typeOfSupervisorNeeded[]=Medical Director.
  needsMedicalDirector: true,
}
