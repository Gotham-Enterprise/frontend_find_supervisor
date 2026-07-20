import { describe, expect, it } from 'vitest'

import { formatNameWithCredentials } from '@/lib/utils/profile-formatters'

describe('formatNameWithCredentials', () => {
  it('appends credentials after the full name', () => {
    expect(formatNameWithCredentials('Jane Smith', 'Ph.D., NCC, LPC-S (AL), LPC (MI)')).toBe(
      'Jane Smith, Ph.D., NCC, LPC-S (AL), LPC (MI)',
    )
  })

  it('returns the name alone without an extra comma when credentials are empty', () => {
    expect(formatNameWithCredentials('Jane Smith', '')).toBe('Jane Smith')
    expect(formatNameWithCredentials('Jane Smith', null)).toBe('Jane Smith')
    expect(formatNameWithCredentials('Jane Smith', undefined)).toBe('Jane Smith')
  })

  it('treats whitespace-only credentials as empty', () => {
    expect(formatNameWithCredentials('Jane Smith', '   ')).toBe('Jane Smith')
  })

  it('trims leading and trailing whitespace from both parts', () => {
    expect(formatNameWithCredentials(' Jane Smith ', ' Ph.D. ')).toBe('Jane Smith, Ph.D.')
  })

  it('returns the credentials alone when the name is missing', () => {
    expect(formatNameWithCredentials('', 'Ph.D.')).toBe('Ph.D.')
    expect(formatNameWithCredentials(null, '')).toBe('')
  })
})
