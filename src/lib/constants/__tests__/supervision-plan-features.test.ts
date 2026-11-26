import { describe, expect, it } from 'vitest'

import {
  getFreePlanFeatures,
  getPremiumPlanFeatures,
  getSupervisionRoleCopy,
  getSupervisionRoleKind,
} from '../supervision-plan-features'

describe('getSupervisionRoleKind', () => {
  it('maps the supervisor type to a role kind, defaulting to supervisor', () => {
    expect(getSupervisionRoleKind('Medical Director')).toBe('medical-director')
    expect(getSupervisionRoleKind('MEDICAL_DIRECTOR')).toBe('medical-director')
    expect(getSupervisionRoleKind('Preceptor')).toBe('preceptor')
    expect(getSupervisionRoleKind('Mental Health Counselors')).toBe('supervisor')
    expect(getSupervisionRoleKind('')).toBe('supervisor')
    expect(getSupervisionRoleKind(undefined)).toBe('supervisor')
  })
})

describe('plan feature lists', () => {
  it('words the supervisor list exactly as before', () => {
    expect(getFreePlanFeatures('supervisor').map((f) => f.label)).toEqual([
      'Receive and view supervisee requests',
      'See visibility into interested supervisees',
      'Basic profile listing in search',
      'Platform notifications for new activity',
    ])
    expect(getPremiumPlanFeatures('supervisor')[0].label).toBe('Accept supervisee requests')
  })

  it('speaks of clients for Medical Directors and preceptees for Preceptors', () => {
    const md = [
      ...getFreePlanFeatures('medical-director'),
      ...getPremiumPlanFeatures('medical-director'),
    ]
    const preceptor = [...getFreePlanFeatures('preceptor'), ...getPremiumPlanFeatures('preceptor')]
    expect(md.some((f) => /supervisee/i.test(f.label))).toBe(false)
    expect(preceptor.some((f) => /supervisee/i.test(f.label))).toBe(false)
    expect(md.map((f) => f.label)).toContain('Accept client requests')
    expect(preceptor.map((f) => f.label)).toContain('Accept preceptee requests')
    expect(getSupervisionRoleCopy('preceptor').counterpartPlural).toBe('preceptees')
    expect(getSupervisionRoleCopy('medical-director').roleNounLower).toBe('medical director')
  })

  it('keeps the same number of free and premium rows per role', () => {
    for (const kind of ['supervisor', 'medical-director', 'preceptor'] as const) {
      expect(getFreePlanFeatures(kind)).toHaveLength(4)
      expect(getPremiumPlanFeatures(kind)).toHaveLength(5)
    }
  })
})
