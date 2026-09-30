import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  getPhysicianRoleForOccupation,
  PHYSICIAN_OVERSIGHT_RULES,
} from '@/lib/constants/physician-oversight-rules'

import { getOversightRows, PhysicianOversightGuide } from '../PhysicianOversightGuide'

describe('physician oversight data', () => {
  it('has one sourced entry per state and role', () => {
    const keys = PHYSICIAN_OVERSIGHT_RULES.map((r) => `${r.state}:${r.role}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const rule of PHYSICIAN_OVERSIGHT_RULES) {
      expect(rule.sourceUrl).toMatch(/^https?:\/\//)
      expect(rule.citation).not.toBe('')
    }
  })

  it('maps NP and PA occupations to roles', () => {
    expect(getPhysicianRoleForOccupation('Nurse Practitioner')).toBe('NP')
    expect(getPhysicianRoleForOccupation(' physician assistant ')).toBe('PA')
    expect(getPhysicianRoleForOccupation('Psychologist Intern')).toBeNull()
  })
})

describe('getOversightRows', () => {
  it('flags a conditional remote physician as a caution', () => {
    const flPa = PHYSICIAN_OVERSIGHT_RULES.find((r) => r.state === 'FL' && r.role === 'PA')!
    const remote = getOversightRows(flPa).find((row) => row.label === 'Remote physician allowed?')
    expect(remote?.tone).toBe('caution')
    expect(remote?.text).toMatch(/reasonable physical proximity/)
  })

  it('falls back to status text when an entry has no detail', () => {
    const ilNp = PHYSICIAN_OVERSIGHT_RULES.find((r) => r.state === 'IL' && r.role === 'NP')!
    const ratio = getOversightRows(ilNp).find((row) => row.label === 'Physician ratio limit')
    expect(ratio).toMatchObject({ tone: 'good', text: 'No limit' })
  })
})

describe('PhysicianOversightGuide', () => {
  it('shows one role with its labelled rows', () => {
    render(<PhysicianOversightGuide state="TX" stateName="Texas" role="NP" />)

    expect(screen.getByText(/Physician oversight rules in Texas/)).toBeInTheDocument()
    expect(screen.getByText('Collaborating physician required?')).toBeInTheDocument()
    expect(screen.getByText('Remote physician allowed?')).toBeInTheDocument()
    expect(screen.queryByText('Supervising physician required?')).not.toBeInTheDocument()
  })

  it('shows both roles when no role is given', () => {
    render(<PhysicianOversightGuide state="CA" stateName="California" role={null} />)

    expect(screen.getByText('Collaborating physician required?')).toBeInTheDocument()
    expect(screen.getByText('Supervising physician required?')).toBeInTheDocument()
  })

  it('hides or shows a board reminder for states without data', () => {
    const { container } = render(
      <PhysicianOversightGuide state="GA" stateName="Georgia" role="PA" hideWhenNoData />,
    )
    expect(container).toBeEmptyDOMElement()

    render(<PhysicianOversightGuide state="GA" stateName="Georgia" role="PA" />)
    expect(
      screen.getByText(/haven't verified Georgia's physician collaboration rules/),
    ).toBeInTheDocument()
  })
})
