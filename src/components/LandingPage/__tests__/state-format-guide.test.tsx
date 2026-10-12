import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { stateSlugToDisplayName } from '@/lib/seo/routes'

import { StateFormatGuide } from '../state-format-guide'

describe('StateFormatGuide', () => {
  it('starts with no state selected and shows instructions instead of rules', () => {
    render(<StateFormatGuide />)

    expect(
      screen.getByRole('heading', { name: 'Check Supervision Rules in Your State' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Select a state to see its rules/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Supervision format rules')).not.toBeInTheDocument()
  })
})

describe('stateSlugToDisplayName', () => {
  it('keeps "of" lowercase inside a state name', () => {
    expect(stateSlugToDisplayName('district-of-columbia')).toBe('District of Columbia')
    expect(stateSlugToDisplayName('new-york')).toBe('New York')
  })
})
