import { describe, expect, it } from 'vitest'

import { formatSuperviseeDisplayName, maskNameToFirstInitial } from '../profile-formatters'

describe('maskNameToFirstInitial', () => {
  it.each([
    ['Katie Cruz', 'Katie C'],
    ['Dr. Julie Robinson', 'Dr. Julie R'],
    ['Dr Julie Robinson', 'Dr Julie R'],
    ['Dr. Julie Robinson, PsyD, LMFT, M.Ed.', 'Dr. Julie R'],
    ['Julie Robinson, PsyD', 'Julie R'],
    ['Dr. Robinson', 'Dr. R'],
    ['Dr.', 'Dr.'],
    ['Jim Santiano 02', 'Jim S'],
    ['Jim Santiano Jr.', 'Jim S'],
    ['Mary Ann de la Cruz', 'Mary C'],
    ['Madonna', 'Madonna'],
    ['  ', ''],
    [null, ''],
    [undefined, ''],
  ])('masks %j to %j', (input, expected) => {
    expect(maskNameToFirstInitial(input)).toBe(expected)
  })
})

describe('formatSuperviseeDisplayName', () => {
  it('shows the full name once connected and the masked name otherwise', () => {
    expect(formatSuperviseeDisplayName('Dr. Julie Robinson', 'ACTIVE')).toBe('Dr. Julie Robinson')
    expect(formatSuperviseeDisplayName('Dr. Julie Robinson', 'PENDING')).toBe('Dr. Julie R')
  })
})
