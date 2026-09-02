import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { matchSignupServerFieldError } from '../serverFieldErrors'

function makeApiError(body: unknown, status = 400): AxiosError {
  const headers = new AxiosHeaders()
  const config = { headers }
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    config,
    {},
    {
      data: body,
      status,
      statusText: 'Bad Request',
      headers,
      config,
    },
  )
}

describe('matchSignupServerFieldError', () => {
  it('maps "Invalid contact number." to the contactNumber field with the humanized message', () => {
    const match = matchSignupServerFieldError(
      makeApiError({ success: false, error: 'Invalid contact number.' }),
    )
    expect(match?.field).toBe('contactNumber')
    expect(match?.message).toMatch(/phone number you entered is not valid/i)
  })

  it('maps "Contact number already exists." to contactNumber', () => {
    const match = matchSignupServerFieldError(
      makeApiError({ success: false, error: 'Contact number already exists.' }),
    )
    expect(match?.field).toBe('contactNumber')
    expect(match?.message).toMatch(/already in use/i)
  })

  it('maps "Email already exists." to email', () => {
    const match = matchSignupServerFieldError(
      makeApiError({ success: false, error: 'Email already exists.' }),
    )
    expect(match?.field).toBe('email')
    expect(match?.message).toMatch(/already registered/i)
  })

  it('returns null for errors that do not belong to a field', () => {
    expect(
      matchSignupServerFieldError(makeApiError({ success: false, error: 'Something broke.' }, 500)),
    ).toBeNull()
  })

  it('returns null for non-axios errors', () => {
    expect(matchSignupServerFieldError(new Error('boom'))).toBeNull()
  })
})
