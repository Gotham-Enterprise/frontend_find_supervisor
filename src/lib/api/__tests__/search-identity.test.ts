import { describe, expect, it } from 'vitest'

import { mapApiRowToSuperviseeSearchResult } from '@/lib/api/supervisee-search'
import { mapApiRowToSupervisorSearchResult } from '@/lib/api/supervisor-search'
import { formatPublicIdentity } from '@/lib/utils/identity-display'

describe('formatPublicIdentity — rows the API already gated', () => {
  it('maps codes to labels and treats missing fields as empty', () => {
    expect(
      formatPublicIdentity({
        pronouns: ['SHE_HER_HERS', 'THEY_THEM_THEIRS'],
        genderIdentity: 'NON_BINARY',
        languages: ['en', 'tl'],
      }),
    ).toEqual({
      pronouns: 'She / Her / Hers, They / Them / Theirs',
      genderIdentity: 'Non-Binary',
      languages: ['English', 'Tagalog'],
    })
    expect(formatPublicIdentity({})).toEqual({ pronouns: '', genderIdentity: null, languages: [] })
  })

  it('uses the self-description and still never shows "Prefer not to say"', () => {
    expect(
      formatPublicIdentity({ genderIdentity: 'SELF_DESCRIBE', customGenderIdentity: 'Agender' })
        .genderIdentity,
    ).toBe('Agender')
    expect(formatPublicIdentity({ genderIdentity: 'PREFER_NOT_TO_SAY' }).genderIdentity).toBeNull()
  })
})

describe('search result mappers — identity on browse cards', () => {
  it('carries the public identity through the supervisor mapper', () => {
    const result = mapApiRowToSupervisorSearchResult(
      {
        id: 's1',
        fullName: 'Jo Lee',
        pronouns: ['HE_HIM_HIS'],
        genderIdentity: 'MALE',
        languages: ['es'],
      },
      0,
    )
    expect(result.identity).toEqual({
      pronouns: 'He / Him / His',
      genderIdentity: 'Male',
      languages: ['Spanish'],
    })
  })

  it('carries the public identity through the supervisee mapper and tolerates older rows', () => {
    const withIdentity = mapApiRowToSuperviseeSearchResult(
      { id: 'e1', fullName: 'Sam R', pronouns: ['THEY_THEM_THEIRS'], languages: ['ko', 'en'] },
      0,
    )
    expect(withIdentity.identity).toEqual({
      pronouns: 'They / Them / Theirs',
      genderIdentity: null,
      languages: ['Korean', 'English'],
    })

    const legacy = mapApiRowToSuperviseeSearchResult({ id: 'e2', fullName: 'Old Row' }, 1)
    expect(legacy.identity).toEqual({ pronouns: '', genderIdentity: null, languages: [] })
  })
})
