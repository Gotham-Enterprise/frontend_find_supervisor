import { afterEach, describe, expect, it } from 'vitest'

import { GTM_EVENTS, pushGtmEvent, SIGNUP_GTM_EVENT } from './gtm'

describe('pushGtmEvent', () => {
  afterEach(() => {
    delete window.dataLayer
  })

  it('creates the dataLayer when GTM has not loaded yet and records the event', () => {
    pushGtmEvent({ event: GTM_EVENTS.SUPERVISOR_SIGNUP_SUCCESS })
    expect(window.dataLayer).toEqual([{ event: 'supervisor_full_registration_success' }])
  })

  it('appends to an existing dataLayer without replacing it', () => {
    const existing: unknown[] = [{ event: 'gtm.js' }]
    window.dataLayer = existing
    pushGtmEvent({ event: GTM_EVENTS.SUPERVISEE_SIGNUP_SUCCESS })
    expect(window.dataLayer).toBe(existing)
    expect(existing).toHaveLength(2)
  })
})

describe('SIGNUP_GTM_EVENT', () => {
  it('gives every signup entry point its own event name', () => {
    expect(SIGNUP_GTM_EVENT).toEqual({
      supervisor: 'supervisor_full_registration_success',
      'medical-director': 'medical_director_full_registration_success',
      supervisee: 'supervisee_full_registration_success',
      'need-medical-director': 'need_medical_director_full_registration_success',
    })
    expect(new Set(Object.values(SIGNUP_GTM_EVENT)).size).toBe(4)
  })
})
