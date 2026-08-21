import { describe, expect, it } from 'vitest'

import type { MedicalDirectorFormValues } from '@/components/Signup/schema'
import {
  buildBoardCertificationsPayload,
  buildOfferingsPayload,
  buildSupervisorFormData,
  type SupervisorRegisterValues,
} from '@/lib/api/signup'

const FUTURE_DATE = '2099-01-01'

const validOffering = {
  occupation: 'MD for Physician Assistants',
  specialty: 'Internal Medicine',
  degreeType: 'MD',
  licenses: [
    { licenseType: '', licenseNumber: 'B456', state: 'TX', licenseExpiration: FUTURE_DATE },
  ],
}

const blankOffering = {
  occupation: '',
  specialty: '',
  degreeType: '',
  licenses: [{ licenseType: '', licenseNumber: '', state: '', licenseExpiration: '' }],
}

function makeValues(overrides: Partial<MedicalDirectorFormValues> = {}): SupervisorRegisterValues {
  return {
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
    supervisorType: 'Medical Director',
    supervisorOccupationId: 'Medical Doctor',
    supervisorSpecialtyId: '',
    degreeType: 'MD',
    licenses: [
      { licenseType: '', licenseNumber: 'A123', state: 'TX', licenseExpiration: FUTURE_DATE },
    ],
    npiNumber: '',
    certifications: [],
    yearsOfExperience: '5 – 10 years',
    licenseDoc: new File(['x'], 'license.pdf', { type: 'application/pdf' }),
    patientPopulation: ['Adults'],
    supervisionFormat: 'virtual',
    availability: 'Flexible',
    acceptingNewSupervisees: true,
    professionalSummary: 'A professional summary longer than twenty characters.',
    describeYourself: 'A self description longer than twenty characters.',
    supervisionFeeType: 'MONTHLY',
    supervisionFeeAmount: 500,
    uploadProfilePhoto: new File(['x'], 'photo.png', { type: 'image/png' }),
    agreedToPost: true,
    agreedToTerms: true,
    offerSupervisingPhysician: false,
    offerCollaboratingPhysician: false,
    offerings: {
      supervising: structuredClone(blankOffering),
      collaborating: structuredClone(blankOffering),
    },
    ...overrides,
  } as SupervisorRegisterValues
}

describe('buildOfferingsPayload', () => {
  it('returns nothing when no offering is checked', () => {
    expect(buildOfferingsPayload(makeValues())).toEqual([])
  })

  it('returns nothing for plain supervisor values without offering fields', () => {
    const values = makeValues()
    delete values.offerSupervisingPhysician
    delete values.offerCollaboratingPhysician
    delete values.offerings
    expect(buildOfferingsPayload(values)).toEqual([])
  })

  it('maps a checked offering to its supervisorType name without licenseType', () => {
    const values = makeValues({
      offerSupervisingPhysician: true,
      offerings: {
        supervising: structuredClone(validOffering),
        collaborating: structuredClone(blankOffering),
      },
    })
    const payload = buildOfferingsPayload(values)
    expect(payload).toHaveLength(1)
    expect(payload[0].supervisorType).toBe('Supervising Physician')
    expect(payload[0].occupation).toBe('MD for Physician Assistants')
    expect(payload[0].specialty).toBe('Internal Medicine')
    expect(payload[0].degreeType).toBe('MD')
    expect(payload[0].licenses).toEqual([
      { licenseNumber: 'B456', state: 'TX', licenseExpiration: FUTURE_DATE },
    ])
    expect(Object.keys(payload[0].licenses[0])).not.toContain('licenseType')
  })

  it('omits specialty when empty', () => {
    const values = makeValues({
      offerCollaboratingPhysician: true,
      offerings: {
        supervising: structuredClone(blankOffering),
        collaborating: structuredClone({ ...validOffering, specialty: '' }),
      },
    })
    const payload = buildOfferingsPayload(values)
    expect(payload).toHaveLength(1)
    expect(payload[0].supervisorType).toBe('Collaborating Physician')
    expect('specialty' in payload[0]).toBe(false)
  })

  it('excludes a filled block whose checkbox is unchecked', () => {
    const values = makeValues({
      offerSupervisingPhysician: true,
      offerings: {
        supervising: structuredClone(validOffering),
        collaborating: structuredClone(validOffering),
      },
    })
    const payload = buildOfferingsPayload(values)
    expect(payload).toHaveLength(1)
    expect(payload[0].supervisorType).toBe('Supervising Physician')
  })

  it('returns both offerings in order when both are checked', () => {
    const values = makeValues({
      offerSupervisingPhysician: true,
      offerCollaboratingPhysician: true,
      offerings: {
        supervising: structuredClone(validOffering),
        collaborating: structuredClone(validOffering),
      },
    })
    expect(buildOfferingsPayload(values).map((o) => o.supervisorType)).toEqual([
      'Supervising Physician',
      'Collaborating Physician',
    ])
  })
})

const validBoardCertification = {
  certifyingBoard: 'American Board of Internal Medicine',
  certifyingBoardOther: '',
  specialty: 'Internal Medicine',
  subspecialty: '',
  certificationNumber: '123456',
  expirationDate: FUTURE_DATE,
}

describe('buildBoardCertificationsPayload', () => {
  it('returns nothing when Board Certified is No, even with filled entries', () => {
    const values = makeValues({
      boardCertified: false,
      boardCertifications: [structuredClone(validBoardCertification)],
    })
    expect(buildBoardCertificationsPayload(values)).toEqual([])
  })

  it('returns nothing for plain supervisor values without the fields', () => {
    const values = makeValues()
    delete values.boardCertified
    delete values.boardCertifications
    expect(buildBoardCertificationsPayload(values)).toEqual([])
  })

  it('maps entries and omits the empty subspecialty when Yes', () => {
    const values = makeValues({
      boardCertified: true,
      boardCertifications: [structuredClone(validBoardCertification)],
    })
    const payload = buildBoardCertificationsPayload(values)
    expect(payload).toEqual([
      {
        certifyingBoard: 'American Board of Internal Medicine',
        specialty: 'Internal Medicine',
        certificationNumber: '123456',
        expirationDate: FUTURE_DATE,
      },
    ])
  })

  it('includes filled optionals', () => {
    const values = makeValues({
      boardCertified: true,
      boardCertifications: [
        structuredClone({
          ...validBoardCertification,
          subspecialty: 'Cardiovascular Disease',
          certificationNumber: '123456',
          expirationDate: FUTURE_DATE,
        }),
      ],
    })
    expect(buildBoardCertificationsPayload(values)[0]).toEqual({
      certifyingBoard: 'American Board of Internal Medicine',
      specialty: 'Internal Medicine',
      subspecialty: 'Cardiovascular Disease',
      certificationNumber: '123456',
      expirationDate: FUTURE_DATE,
    })
  })

  it('resolves the Other board to the free-text name', () => {
    const values = makeValues({
      boardCertified: true,
      boardCertifications: [
        structuredClone({
          ...validBoardCertification,
          certifyingBoard: 'Other',
          certifyingBoardOther: 'American Osteopathic Board of Family Physicians',
        }),
      ],
    })
    expect(buildBoardCertificationsPayload(values)[0].certifyingBoard).toBe(
      'American Osteopathic Board of Family Physicians',
    )
  })
})

describe('buildSupervisorFormData — boardCertifications field', () => {
  it('omits the field when Board Certified is No', () => {
    const fd = buildSupervisorFormData(makeValues())
    expect(fd.get('boardCertifications')).toBeNull()
  })

  it('appends the JSON when Yes', () => {
    const fd = buildSupervisorFormData(
      makeValues({
        boardCertified: true,
        boardCertifications: [structuredClone(validBoardCertification)],
      }),
    )
    const parsed = JSON.parse(String(fd.get('boardCertifications')))
    expect(parsed).toEqual([
      {
        certifyingBoard: 'American Board of Internal Medicine',
        specialty: 'Internal Medicine',
        certificationNumber: '123456',
        expirationDate: FUTURE_DATE,
      },
    ])
  })
})

describe('buildSupervisorFormData — offerings field', () => {
  it('omits the offerings field when nothing is checked', () => {
    const fd = buildSupervisorFormData(makeValues())
    expect(fd.get('offerings')).toBeNull()
    expect(fd.get('supervisorType')).toBe('Medical Director')
  })

  it('appends offerings JSON when an offering is checked', () => {
    const fd = buildSupervisorFormData(
      makeValues({
        offerSupervisingPhysician: true,
        offerings: {
          supervising: structuredClone(validOffering),
          collaborating: structuredClone(blankOffering),
        },
      }),
    )
    const raw = fd.get('offerings')
    expect(typeof raw).toBe('string')
    const parsed = JSON.parse(String(raw))
    expect(parsed).toEqual([
      {
        supervisorType: 'Supervising Physician',
        occupation: 'MD for Physician Assistants',
        specialty: 'Internal Medicine',
        degreeType: 'MD',
        licenses: [{ licenseNumber: 'B456', state: 'TX', licenseExpiration: FUTURE_DATE }],
      },
    ])
  })

  it('keeps the rest of the supervisor payload unchanged', () => {
    const fd = buildSupervisorFormData(makeValues())
    expect(fd.get('role')).toBe('SUPERVISOR')
    expect(fd.get('degreeType')).toBe('MD')
    expect(fd.get('occupation')).toBe('Medical Doctor')
    const licenses = JSON.parse(String(fd.get('licenses')))
    expect(licenses).toEqual([
      { licenseNumber: 'A123', state: 'TX', licenseExpiration: FUTURE_DATE },
    ])
  })
})
