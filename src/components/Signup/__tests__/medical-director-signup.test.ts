import { describe, expect, it } from 'vitest'

import { medicalDirectorDefaultValues, parseSignupRoleFromType } from '../helpers'
import {
  MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
  type MedicalDirectorFormValues,
  medicalDirectorSchema,
  medicalDirectorStep2Schema,
} from '../schema'
import { findFirstStepWithError } from '../SupervisorSignupForm/applyZodIssuesToForm'

const FUTURE_DATE = '2099-01-01'
const PAST_DATE = '2020-01-01'

const validLicense = {
  licenseType: '',
  licenseNumber: 'A123',
  state: 'TX',
  licenseExpiration: FUTURE_DATE,
}

const blankOffering = {
  occupation: '',
  specialty: '',
  degreeType: '',
  licenses: [{ licenseType: '', licenseNumber: '', state: '', licenseExpiration: '' }],
}

const blankBoardCertification = {
  certifyingBoard: '',
  certifyingBoardOther: '',
  specialty: '',
  subspecialty: '',
  certificationNumber: '',
  expirationDate: '',
}

const validBoardCertification = {
  certifyingBoard: 'American Board of Internal Medicine',
  certifyingBoardOther: '',
  specialty: 'Internal Medicine',
  subspecialty: '',
  certificationNumber: '',
  expirationDate: '',
}

const validOffering = {
  occupation: 'MD for Physician Assistants',
  specialty: 'Internal Medicine',
  degreeType: 'MD',
  licenses: [{ ...validLicense }],
}

function makeFile(name = 'license.pdf') {
  return new File(['x'], name, { type: 'application/pdf' })
}

/** Valid step-2 values with both offering checkboxes unchecked. */
function step2Base() {
  return {
    supervisorType: 'Medical Director',
    supervisorOccupationId: 'Medical Doctor',
    supervisorSpecialtyId: '',
    degreeType: 'MD',
    licenses: [{ ...validLicense }],
    npiNumber: '',
    certifications: [],
    yearsOfExperience: '5 – 10 years',
    licenseDoc: makeFile(),
    offerSupervisingPhysician: false,
    offerCollaboratingPhysician: false,
    offerings: {
      supervising: structuredClone(blankOffering),
      collaborating: structuredClone(blankOffering),
    },
    boardCertified: false,
    boardCertifications: [structuredClone(blankBoardCertification)],
  }
}

function issuePaths(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.success ? [] : (result.error?.issues.map((i) => i.path.join('.')) ?? [])
}

describe('parseSignupRoleFromType', () => {
  it('parses the medical-director query param', () => {
    expect(parseSignupRoleFromType('medical-director')).toBe('medical-director')
  })

  it('keeps the existing behaviors for other values', () => {
    expect(parseSignupRoleFromType('supervisee')).toBe('supervisee')
    expect(parseSignupRoleFromType('supervisor')).toBe('supervisor')
    expect(parseSignupRoleFromType('garbage')).toBe('supervisor')
    expect(parseSignupRoleFromType(null)).toBe('supervisor')
  })
})

describe('medicalDirectorDefaultValues', () => {
  it('presets the supervisor type and unchecked offering blocks', () => {
    expect(medicalDirectorDefaultValues.supervisorType).toBe('Medical Director')
    expect(medicalDirectorDefaultValues.offerSupervisingPhysician).toBe(false)
    expect(medicalDirectorDefaultValues.offerCollaboratingPhysician).toBe(false)
    expect(medicalDirectorDefaultValues.offerings?.supervising.licenses).toHaveLength(1)
  })
})

describe('medicalDirectorStep2Schema — offerings', () => {
  it('passes with both offerings unchecked and blank blocks', () => {
    const result = medicalDirectorStep2Schema.safeParse(step2Base())
    expect(issuePaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  it('requires the full block when an offering is checked', () => {
    const result = medicalDirectorStep2Schema.safeParse({
      ...step2Base(),
      offerSupervisingPhysician: true,
    })
    expect(result.success).toBe(false)
    const paths = issuePaths(result)
    expect(paths).toContain('offerings.supervising.occupation')
    expect(paths).toContain('offerings.supervising.degreeType')
    expect(paths).toContain('offerings.supervising.licenses.0.licenseNumber')
    expect(paths).toContain('offerings.supervising.licenses.0.state')
    expect(paths).toContain('offerings.supervising.licenses.0.licenseExpiration')
  })

  it('ignores a filled block whose checkbox is unchecked', () => {
    const base = step2Base()
    base.offerings.collaborating = structuredClone(validOffering)
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('passes with a fully valid checked offering', () => {
    const base = step2Base()
    base.offerSupervisingPhysician = true
    base.offerings.supervising = structuredClone(validOffering)
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  it('rejects a degree type other than MD/DO inside a checked offering', () => {
    const base = step2Base()
    base.offerCollaboratingPhysician = true
    base.offerings.collaborating = structuredClone({ ...validOffering, degreeType: 'PhD' })
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('offerings.collaborating.degreeType')
  })

  it('rejects a past license expiration inside a checked offering', () => {
    const base = step2Base()
    base.offerSupervisingPhysician = true
    base.offerings.supervising = structuredClone(validOffering)
    base.offerings.supervising.licenses[0].licenseExpiration = PAST_DATE
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('offerings.supervising.licenses.0.licenseExpiration')
  })

  it('requires at least one license entry in a checked offering', () => {
    const base = step2Base()
    base.offerSupervisingPhysician = true
    base.offerings.supervising = structuredClone({ ...validOffering, licenses: [] })
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('offerings.supervising.licenses')
  })
})

describe('medicalDirectorStep2Schema — board certifications', () => {
  it('passes with Board Certified No and a blank entry', () => {
    const result = medicalDirectorStep2Schema.safeParse(step2Base())
    expect(result.success).toBe(true)
  })

  it('ignores filled entries when Board Certified is No', () => {
    const base = step2Base()
    base.boardCertifications = [structuredClone(validBoardCertification)]
    expect(medicalDirectorStep2Schema.safeParse(base).success).toBe(true)
  })

  it('requires board and specialty per entry when Board Certified is Yes', () => {
    const result = medicalDirectorStep2Schema.safeParse({
      ...step2Base(),
      boardCertified: true,
    })
    expect(result.success).toBe(false)
    const paths = issuePaths(result)
    expect(paths).toContain('boardCertifications.0.certifyingBoard')
    expect(paths).toContain('boardCertifications.0.specialty')
  })

  it('passes with a valid certification when Yes', () => {
    const base = step2Base()
    base.boardCertified = true
    base.boardCertifications = [structuredClone(validBoardCertification)]
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  it('requires the free-text board name when Other is selected', () => {
    const base = step2Base()
    base.boardCertified = true
    base.boardCertifications = [
      structuredClone({ ...validBoardCertification, certifyingBoard: 'Other' }),
    ]
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('boardCertifications.0.certifyingBoardOther')
  })

  it('rejects a past expiration date', () => {
    const base = step2Base()
    base.boardCertified = true
    base.boardCertifications = [
      structuredClone({ ...validBoardCertification, expirationDate: PAST_DATE }),
    ]
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('boardCertifications.0.expirationDate')
  })

  it('accepts a future expiration and filled optionals', () => {
    const base = step2Base()
    base.boardCertified = true
    base.boardCertifications = [
      structuredClone({
        ...validBoardCertification,
        subspecialty: 'Cardiovascular Disease',
        certificationNumber: '123456',
        expirationDate: FUTURE_DATE,
      }),
    ]
    expect(medicalDirectorStep2Schema.safeParse(base).success).toBe(true)
  })

  it('requires at least one entry when Yes with an empty array', () => {
    const base = step2Base()
    base.boardCertified = true
    base.boardCertifications = []
    const result = medicalDirectorStep2Schema.safeParse(base)
    expect(issuePaths(result)).toContain('boardCertifications')
  })
})

describe('medical director step error routing', () => {
  it('routes nested offering paths to step 2 (index 1)', () => {
    expect(
      findFirstStepWithError(
        ['offerings.supervising.licenses.0.state'],
        MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
      ),
    ).toBe(1)
    expect(
      findFirstStepWithError(['offerCollaboratingPhysician'], MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS),
    ).toBe(1)
    expect(
      findFirstStepWithError(
        ['boardCertifications.0.certifyingBoard'],
        MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
      ),
    ).toBe(1)
  })

  it('still routes account fields to step 1 (index 0)', () => {
    expect(findFirstStepWithError(['email'], MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS)).toBe(0)
  })
})

describe('medicalDirectorSchema — full form', () => {
  function fullValues(): MedicalDirectorFormValues {
    return {
      ...step2Base(),
      fullName: 'Dr Test',
      professionalCredentials: '',
      email: 'md@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      contactNumber: '(512) 555-0100',
      city: 'Austin',
      state: 'TX',
      zipcode: '78701',
      website: '',
      patientPopulation: ['Adults'],
      supervisionFormat: 'virtual',
      availability: 'Flexible',
      acceptingNewSupervisees: true,
      professionalSummary: 'A professional summary longer than twenty characters.',
      describeYourself: 'A self description longer than twenty characters.',
      supervisionFeeType: 'MONTHLY',
      supervisionFeeAmount: 500,
      uploadProfilePhoto: makeFile('photo.png'),
      agreedToPost: true,
      agreedToTerms: true,
    } as MedicalDirectorFormValues
  }

  it('passes end-to-end with one checked, valid offering', () => {
    const values = fullValues()
    values.offerSupervisingPhysician = true
    values.offerings.supervising = structuredClone(validOffering)
    const result = medicalDirectorSchema.safeParse(values)
    expect(issuePaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  it('enforces the monthly-only fee rule for Medical Directors', () => {
    const values = fullValues()
    values.supervisionFeeType = 'HOURLY'
    const result = medicalDirectorSchema.safeParse(values)
    expect(issuePaths(result)).toContain('supervisionFeeType')
  })

  it('allows an empty patient population for a plain Medical Director', () => {
    const values = fullValues()
    values.patientPopulation = []
    const result = medicalDirectorSchema.safeParse(values)
    expect(issuePaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  it('requires patient population once a physician offering is checked', () => {
    const values = fullValues()
    values.patientPopulation = []
    values.offerSupervisingPhysician = true
    values.offerings.supervising = structuredClone(validOffering)
    const result = medicalDirectorSchema.safeParse(values)
    expect(issuePaths(result)).toContain('patientPopulation')
  })
})
