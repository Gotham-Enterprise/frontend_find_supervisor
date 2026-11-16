import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { TagInput, type TagOption } from '@/components/ui/tag-input'

const OPTIONS: TagOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fil', label: 'Filipino' },
]

function Harness({
  searchable = false,
  initial = [] as string[],
  onChangeSpy,
}: {
  searchable?: boolean
  initial?: string[]
  onChangeSpy?: (values: string[]) => void
}) {
  const [value, setValue] = useState<string[]>(initial)
  return (
    <TagInput
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChangeSpy?.(next)
      }}
      placeholder="Select languages you speak"
      searchable={searchable}
      searchPlaceholder="Search languages…"
      aria-label="Languages"
    />
  )
}

describe('TagInput', () => {
  it('shows the placeholder, then chips for each selection (dropdown stays open)', () => {
    render(<Harness />)
    expect(screen.getByText('Select languages you speak')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('combobox', { name: 'Languages' }))
    fireEvent.mouseDown(screen.getByRole('option', { name: 'English' }))
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Spanish' }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Remove English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Spanish' })).toBeInTheDocument()
    expect(screen.queryByText('Select languages you speak')).not.toBeInTheDocument()
  })

  it('removes a single chip without touching the others', () => {
    const changes: string[][] = []
    render(<Harness initial={['en', 'es']} onChangeSpy={(v) => changes.push(v)} />)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Remove English' }))
    expect(changes.at(-1)).toEqual(['es'])
  })

  it('filters options from the search box and toggles the highlighted row with Enter', () => {
    const changes: string[][] = []
    render(<Harness searchable onChangeSpy={(v) => changes.push(v)} />)

    fireEvent.click(screen.getByRole('combobox', { name: 'Languages' }))
    const search = screen.getByRole('textbox', { name: 'Search languages…' })
    fireEvent.change(search, { target: { value: 'fil' } })

    expect(screen.getByRole('option', { name: 'Filipino' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'English' })).not.toBeInTheDocument()

    fireEvent.keyDown(search, { key: 'Enter' })
    expect(changes.at(-1)).toEqual(['fil'])

    fireEvent.change(search, { target: { value: 'zzz' } })
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('is keyboard operable from the trigger: arrows highlight, Space toggles, Escape closes', () => {
    const changes: string[][] = []
    render(<Harness onChangeSpy={(v) => changes.push(v)} />)
    const trigger = screen.getByRole('combobox', { name: 'Languages' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(changes.at(-1)).toEqual(['es'])

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
