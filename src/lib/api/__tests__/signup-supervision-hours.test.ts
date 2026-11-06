import { describe, expect, it } from 'vitest'

import { superviseeDefaultValues } from '@/components/Signup/helpers'
import type { SuperviseeFormValues } from '@/components/Signup/schema'
import { buildSuperviseeFormData } from '@/lib/api/signup'

const base = {
  ...superviseeDefaultValues,
  stateOfLicensure: ['NY'],
  supervisionHoursNeeded: '2000_3000',
} as unknown as SuperviseeFormValues

describe('buildSuperviseeFormData — supervisionHoursNeeded', () => {
  it('sends the range for a Mental Health Counselor need', () => {
    const fd = buildSuperviseeFormData({ ...base, typeOfSupervisor: 'Mental Health Counselors' })
    expect(fd.get('supervisionHoursNeeded')).toBe('2000_3000')
  })

  it('sends it for physician supervision needs too', () => {
    const fd = buildSuperviseeFormData({ ...base, typeOfSupervisor: 'Collaborating Physician' })
    expect(fd.get('supervisionHoursNeeded')).toBe('2000_3000')
  })

  it('leaves it out for a Medical Director-only request', () => {
    const fd = buildSuperviseeFormData({
      ...base,
      typeOfSupervisor: '',
      needsMedicalDirector: true,
    })
    expect(fd.has('supervisionHoursNeeded')).toBe(false)
  })
})
