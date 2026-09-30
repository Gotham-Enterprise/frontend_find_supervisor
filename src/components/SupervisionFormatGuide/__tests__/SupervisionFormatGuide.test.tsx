import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupervisionFormatGuide } from '..'

describe('SupervisionFormatGuide', () => {
  it('shows format statuses and summary for a single profession', () => {
    render(<SupervisionFormatGuide state="FL" stateName="Florida" profession="COUNSELING" />)

    expect(screen.getByText(/Supervision formats that count in Florida/)).toBeInTheDocument()
    expect(screen.getByText('In-Person').parentElement).toHaveTextContent('In-Person: Counts')
    expect(screen.getByText('Virtual').parentElement).toHaveTextContent('Virtual: Limited')
    expect(screen.getByText(/Up to half of your supervision/)).toBeInTheDocument()
    expect(screen.getByRole('group')).not.toHaveAttribute('open')
  })

  it('reveals conditions and the source link on Details', () => {
    const { container } = render(
      <SupervisionFormatGuide state="FL" stateName="Florida" profession="COUNSELING" />,
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
    render(<SupervisionFormatGuide state="TX" stateName="Texas" profession={null} />)

    expect(screen.getAllByText('Virtual')).toHaveLength(4)
    // Once in the chip rows, once in the collapsed details.
    expect(screen.getAllByText('Counseling (LPC / LMHC)')).toHaveLength(2)
  })

  it('falls back to a board reminder for states without data', () => {
    render(<SupervisionFormatGuide state="GA" stateName="Georgia" profession="MFT" />)

    expect(screen.getByText(/haven't verified Georgia's rules/)).toBeInTheDocument()
  })

  it('renders nothing for states without data when hideWhenNoData is set', () => {
    const { container } = render(
      <SupervisionFormatGuide state="GA" stateName="Georgia" profession={null} hideWhenNoData />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
