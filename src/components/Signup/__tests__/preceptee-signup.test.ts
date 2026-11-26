import { describe, expect, it } from 'vitest'

import { buildSuperviseeFormData } from '@/lib/api/signup'

import { parseSignupRoleFromType, precepteeDefaultValues, preceptorDefaultValues } from '../helpers'
import { type SuperviseeFormValues, superviseeSchema, superviseeStep2Schema } from '../schema'

/** Valid step-2 values for the preceptee (student) flow — Preceptor preset, no credential. */
const validPrecepteeStep2Values = {
  title: '',
  licensureState: '',
  occupationId: '199', // Pharmacy Student
  specialtyId: '',
  schoolName: 'University of Texas at Austin',
  degreeProgram: 'PharmD',
  expectedGraduation: '2027-05-15',
  clinicalHoursRequired: 240,
  rotationStartDate: '2026-09-01',
  rotationEndDate: '2026-12-15',
  typeOfSupervisor: 'Preceptor',
  needsMedicalDirector: false,
  supervisorOccupationId: 'Pharmacist',
  supervisorSpecialtyId: '',
  mdPreferredOccupationId: '',
  mdPreferredSpecialtyId: '',
  preferredFormat: 'in-person',
  stateOfLicensure: ['TX'],
  howSoon: 'WITHIN_2_MONTHS',
  howSoonDate: '',
  mdHowSoon: '',
  mdHowSoonDate: '',
  availability: 'WEEKDAYS',
  supervisionHoursNeeded: '',
  feeType: 'hourly',
  budgetRange: '$0 - $50',
  description: 'Looking for a community pharmacy APPE rotation in Austin.',
}

const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.success ? [] : (result.error?.issues ?? []).map((issue) => issue.path.join('.'))

describe('parseSignupRoleFromType — preceptor / preceptee', () => {
  it('parses the new query params and keeps the fallback', () => {
    expect(parseSignupRoleFromType('preceptor')).toBe('preceptor')
    expect(parseSignupRoleFromType('preceptee')).toBe('preceptee')
    expect(parseSignupRoleFromType('nonsense')).toBe('supervisor')
  })

  it('presets the Preceptor type in both dedicated flows', () => {
    expect(preceptorDefaultValues.supervisorType).toBe('Preceptor')
    expect(precepteeDefaultValues.typeOfSupervisor).toBe('Preceptor')
    expect(precepteeDefaultValues.needsMedicalDirector).toBe(false)
  })
})

describe('superviseeStep2Schema — preceptee (student) flow', () => {
  it('passes without a credential when the program details are given', () => {
    expect(superviseeStep2Schema.safeParse(validPrecepteeStep2Values).success).toBe(true)
  })

  it('requires the program details instead of title / state of licensure', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validPrecepteeStep2Values,
      schoolName: '',
      degreeProgram: ' ',
      expectedGraduation: '',
      clinicalHoursRequired: undefined,
    })
    const paths = issuePaths(result)
    expect(paths).toEqual(
      expect.arrayContaining([
        'schoolName',
        'degreeProgram',
        'expectedGraduation',
        'clinicalHoursRequired',
      ]),
    )
    expect(paths).not.toContain('title')
    expect(paths).not.toContain('licensureState')
  })

  it('does not require supervision hours needed for a Preceptor need', () => {
    expect(issuePaths(superviseeStep2Schema.safeParse(validPrecepteeStep2Values))).not.toContain(
      'supervisionHoursNeeded',
    )
  })

  it('still requires the preceptor profession (occupation cascade) and the budget', () => {
    const paths = issuePaths(
      superviseeStep2Schema.safeParse({
        ...validPrecepteeStep2Values,
        supervisorOccupationId: '',
        budgetRange: '',
      }),
    )
    expect(paths).toEqual(expect.arrayContaining(['supervisorOccupationId', 'budgetRange']))
  })

  it('rejects a rotation end before its start and non-whole / out-of-range hours', () => {
    expect(
      issuePaths(
        superviseeStep2Schema.safeParse({
          ...validPrecepteeStep2Values,
          rotationStartDate: '2026-12-15',
          rotationEndDate: '2026-09-01',
        }),
      ),
    ).toContain('rotationEndDate')
    expect(
      issuePaths(
        superviseeStep2Schema.safeParse({
          ...validPrecepteeStep2Values,
          clinicalHoursRequired: 12.5,
        }),
      ),
    ).toContain('clinicalHoursRequired')
    expect(
      issuePaths(
        superviseeStep2Schema.safeParse({
          ...validPrecepteeStep2Values,
          clinicalHoursRequired: 20001,
        }),
      ),
    ).toContain('clinicalHoursRequired')
  })

  it('keeps title / state of licensure required for licensed supervisees (regression)', () => {
    const paths = issuePaths(
      superviseeStep2Schema.safeParse({
        ...validPrecepteeStep2Values,
        typeOfSupervisor: 'Mental Health Counselors',
        supervisorOccupationId: 'Licensed Mental Health Counselor Supervisors',
        supervisionHoursNeeded: 'UP_TO_1000',
        schoolName: '',
        degreeProgram: '',
        expectedGraduation: '',
        clinicalHoursRequired: undefined,
      }),
    )
    expect(paths).toEqual(expect.arrayContaining(['title', 'licensureState']))
    expect(paths).not.toContain('schoolName')
  })
})

describe('buildSuperviseeFormData — preceptee payload', () => {
  const file = new File(['x'], 'photo.png', { type: 'image/png' })
  const base = {
    ...precepteeDefaultValues,
    ...validPrecepteeStep2Values,
    fullName: 'Pharmacy Student',
    email: 'student@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    contactNumber: '(512) 555-0100',
    city: 'Austin',
    state: 'TX',
    zipcode: '78701',
    introduction: 'Third-year PharmD student.',
    uploadProfilePhoto: file,
    agreedToPost: true,
    agreedToTerms: true,
  } as unknown as SuperviseeFormValues

  it('passes the full schema', () => {
    const parsed = superviseeSchema.safeParse(base)
    expect(issuePaths(parsed)).toEqual([])
  })

  it('sends the program fields and the Preceptor need, and no credential or hours range', () => {
    const fd = buildSuperviseeFormData(base)
    expect(fd.getAll('typeOfSupervisorNeeded[]')).toEqual(['Preceptor'])
    expect(fd.get('schoolName')).toBe('University of Texas at Austin')
    expect(fd.get('degreeProgram')).toBe('PharmD')
    expect(fd.get('expectedGraduation')).toBe('2027-05-15')
    expect(fd.get('clinicalHoursRequired')).toBe('240')
    expect(fd.get('rotationStartDate')).toBe('2026-09-01')
    expect(fd.get('rotationEndDate')).toBe('2026-12-15')
    expect(fd.get('superviseeOccupation')).toBe('Pharmacist')
    expect(fd.has('title')).toBe(false)
    expect(fd.has('licensureState')).toBe(false)
    expect(fd.has('supervisionHoursNeeded')).toBe(false)
    expect(fd.get('budgetRangeType')).toBe('HOURLY')
    expect(fd.has('mdHowSoonLooking')).toBe(false)
  })

  it('omits empty optional rotation dates', () => {
    const fd = buildSuperviseeFormData({ ...base, rotationStartDate: '', rotationEndDate: '' })
    expect(fd.has('rotationStartDate')).toBe(false)
    expect(fd.has('rotationEndDate')).toBe(false)
  })

  it('licensed supervisees still send title / licensureState and never the program fields', () => {
    const fd = buildSuperviseeFormData({
      ...base,
      typeOfSupervisor: 'Mental Health Counselors',
      supervisorOccupationId: 'Licensed Mental Health Counselor Supervisors',
      supervisionHoursNeeded: 'UP_TO_1000',
      title: 'LPC-A',
      licensureState: 'TX',
    })
    expect(fd.get('title')).toBe('LPC-A')
    expect(fd.get('licensureState')).toBe('TX')
    expect(fd.has('schoolName')).toBe(false)
    expect(fd.get('supervisionHoursNeeded')).toBe('UP_TO_1000')
  })
})
