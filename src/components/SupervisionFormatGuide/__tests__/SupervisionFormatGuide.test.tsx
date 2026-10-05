import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupervisionFormatGuide } from '..'

describe('SupervisionFormatGuide', () => {
  it('shows format statuses and summary for a single profession', () => {
    render(
      <SupervisionFormatGuide
        states={[{ code: 'FL', name: 'Florida' }]}
        professions={['COUNSELING']}
      />,
    )

    expect(screen.getByText(/Supervision Formats Allowed in Florida/)).toBeInTheDocument()
    expect(screen.getByText('In-Person').parentElement).toHaveTextContent('In-Person: Allowed')
    expect(screen.getByText('Virtual').parentElement).toHaveTextContent('Virtual: Limited')
    expect(screen.getByText(/Up to half of your supervision/)).toBeInTheDocument()
    expect(screen.getByRole('group')).not.toHaveAttribute('open')
  })

  it('reveals conditions and the source link on Details', () => {
    const { container } = render(
      <SupervisionFormatGuide
        states={[{ code: 'FL', name: 'Florida' }]}
        professions={['COUNSELING']}
      />,
    )

    fireEvent.click(screen.getByText('Details and sources'))

    expect(container.querySelector('details')).toHaveAttribute('open')
    expect(screen.getByText('Group supervision must be in person')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /64B4-2.002/ })).toHaveAttribute(
      'href',
      'https://www.flrules.org/gateway/ruleNo.asp?id=64B4-2.002',
    )
  })

  it('lists every covered profession when the profession is unknown', () => {
    render(<SupervisionFormatGuide states={[{ code: 'TX', name: 'Texas' }]} />)

    // Counseling, Social Work, MFT, Psychology, NP, PA
    expect(screen.getAllByText('Virtual')).toHaveLength(6)
    // Once in the chip rows, once in the collapsed details.
    expect(screen.getAllByText('Counseling (LPC / LMHC)')).toHaveLength(2)
  })

  it('shows one row per state for a single profession', () => {
    render(
      <SupervisionFormatGuide
        states={[
          { code: 'TX', name: 'Texas' },
          { code: 'FL', name: 'Florida' },
        ]}
        professions={['PA']}
      />,
    )

    const heading = screen.getByRole('heading')
    expect(heading).toHaveTextContent(
      /Supervision Formats Allowed\s*· Supervising Physician \(PA\)/,
    )
    expect(heading).not.toHaveTextContent(/Allowed in/)
    // Once in the chip rows, once in the collapsed details.
    expect(screen.getAllByText('Texas')).toHaveLength(2)
    expect(screen.getAllByText('Florida')).toHaveLength(2)
    expect(screen.getAllByText('Virtual')).toHaveLength(2)
  })

  it('labels rows with state and profession when both vary', () => {
    render(
      <SupervisionFormatGuide
        states={[
          { code: 'TX', name: 'Texas' },
          { code: 'FL', name: 'Florida' },
        ]}
        professions={['NP', 'PA']}
      />,
    )

    expect(screen.getAllByText('Florida · Collaborating Physician (NP)')).toHaveLength(2)
  })

  it('falls back to a board reminder for states without data', () => {
    render(
      <SupervisionFormatGuide
        states={[{ code: 'PR', name: 'Puerto Rico' }]}
        professions={['MFT']}
      />,
    )

    expect(
      screen.getByText(/haven't verified the rules on virtual supervision for Puerto Rico/),
    ).toBeInTheDocument()
  })

  it('renders nothing for states without data when hideWhenNoData is set', () => {
    const { container } = render(
      <SupervisionFormatGuide states={[{ code: 'PR', name: 'Puerto Rico' }]} hideWhenNoData />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
