import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CORPORATE_PRACTICE_RULES } from '@/lib/constants/corporate-practice-of-medicine'
import { CORPORATE_PRACTICE_REVIEW_NOTES } from '@/lib/constants/corporate-practice-of-medicine-notes'
import { US_STATES } from '@/lib/seo/routes'

import { CorporatePracticeGuide } from '..'

describe('CorporatePracticeGuide', () => {
  const rule = CORPORATE_PRACTICE_RULES.find((r) => r.state === 'CA')!

  it('shows the status badge, summary, source link, and disclaimer', () => {
    render(<CorporatePracticeGuide stateCode="ca" stateName="California" />)

    expect(
      screen.getByRole('heading', { name: /Corporate Practice of Medicine in California/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(rule.summary)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: rule.sourceLabel })).toHaveAttribute(
      'href',
      rule.sourceUrl,
    )
    expect(screen.getByText(/not legal advice/)).toBeInTheDocument()
  })

  it('renders nothing for an unknown state', () => {
    const { container } = render(<CorporatePracticeGuide stateCode="ZZ" stateName="Nowhere" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CORPORATE_PRACTICE_RULES data', () => {
  it('covers every state + DC exactly once', () => {
    const codes = CORPORATE_PRACTICE_RULES.map((r) => r.state).sort()
    expect(codes).toEqual(Object.values(US_STATES).sort())
  })

  it('keeps an internal review note for every entry', () => {
    expect(Object.keys(CORPORATE_PRACTICE_REVIEW_NOTES).sort()).toEqual(
      CORPORATE_PRACTICE_RULES.map((r) => r.state).sort(),
    )
  })

  it.each(CORPORATE_PRACTICE_RULES.map((r) => [r.state, r] as const))(
    '%s has a well-formed, publishable entry',
    (_state, entry) => {
      expect(['STRICT', 'EXCEPTIONS', 'PERMISSIVE']).toContain(entry.status)
      expect(entry.sourceUrl).toMatch(/^https:\/\//)
      expect(entry.sourceLabel.trim()).not.toBe('')
      expect(entry.citation.trim()).not.toBe('')
      expect(entry.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // Public copy style: short, no em/en dashes or semicolons.
      expect(entry.summary.length).toBeLessThanOrEqual(400)
      expect(entry.summary).not.toMatch(/[—–;]/)
    },
  )
})
