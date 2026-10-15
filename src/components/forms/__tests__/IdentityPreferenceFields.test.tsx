import { act, fireEvent, render, screen } from '@testing-library/react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { IdentityPreferenceFields } from '@/components/forms/IdentityPreferenceFields'
import { Form } from '@/components/ui/form'
import {
  identityPreferenceDefaultValues,
  type IdentityPreferenceFormValues,
} from '@/lib/forms/identity-preferences'

function Harness({
  onForm,
}: {
  onForm: (form: UseFormReturn<IdentityPreferenceFormValues>) => void
}) {
  const form = useForm<IdentityPreferenceFormValues>({
    defaultValues: identityPreferenceDefaultValues,
    mode: 'onTouched',
  })
  onForm(form)
  return (
    <Form {...form}>
      <IdentityPreferenceFields control={form.control} />
    </Form>
  )
}

function renderHarness() {
  let form!: UseFormReturn<IdentityPreferenceFormValues>
  render(
    <Harness
      onForm={(f) => {
        form = f
      }}
    />,
  )
  return () => form
}

describe('IdentityPreferenceFields — visibility checkboxes follow their field', () => {
  it('starts with every visibility checkbox disabled and unchecked (nothing to display yet)', () => {
    renderHarness()
    for (const name of [
      'Display my pronouns on my public profile',
      'Display my gender identity on my public profile',
      'Display my languages on my public profile',
    ]) {
      const checkbox = screen.getByRole('checkbox', { name })
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    }
  })

  it('enables the pronouns checkbox once a pronoun is picked, and unchecks it when cleared', async () => {
    const getForm = renderHarness()
    const checkbox = () =>
      screen.getByRole('checkbox', { name: 'Display my pronouns on my public profile' })

    fireEvent.click(screen.getByRole('combobox', { name: 'Pronouns' }))
    fireEvent.mouseDown(screen.getByRole('option', { name: 'He / Him / His' }))
    expect(checkbox()).toBeEnabled()

    await act(async () => {
      fireEvent.click(checkbox())
    })
    expect(getForm().getValues('showPronouns')).toBe(true)

    // Removing the only pronoun leaves nothing to display: the flag switches off
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Remove He / Him / His' }))
    expect(getForm().getValues('showPronouns')).toBe(false)
    expect(checkbox()).toBeDisabled()
  })

  it('does the same for languages', () => {
    const getForm = renderHarness()
    const checkbox = () =>
      screen.getByRole('checkbox', { name: 'Display my languages on my public profile' })

    fireEvent.click(screen.getByRole('combobox', { name: 'Languages' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search languages…' }), {
      target: { value: 'tagalog' },
    })
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Tagalog' }))
    expect(checkbox()).toBeEnabled()

    fireEvent.click(checkbox())
    expect(getForm().getValues('showLanguages')).toBe(true)

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Remove Tagalog' }))
    expect(getForm().getValues('showLanguages')).toBe(false)
    expect(checkbox()).toBeDisabled()
  })
})
