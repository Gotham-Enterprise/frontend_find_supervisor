import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import {
  needMedicalDirectorDefaultValues,
  superviseeDefaultValues,
} from '@/components/Signup/helpers'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { Form } from '@/components/ui/form'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'

import type { SuperviseeSignupVariant } from '../index'
import { SuperviseeStepProfileTerms } from '../SuperviseeStepProfileTerms'
import { SuperviseeStepSupervisionNeeds } from '../SuperviseeStepSupervisionNeeds'

vi.mock('@/lib/hooks/useSignupOptions', () => ({
  useSpecialtiesByOccupation: () => ({ data: [], isLoading: false }),
}))

vi.mock('@/lib/hooks', () => ({
  useStateNameOptions: () => ({
    data: [{ label: 'Texas', value: 'TX' }],
    isLoading: false,
  }),
}))

const supervisorTypesData: SupervisorTypeData[] = [
  { id: '1', code: 'COLLABORATING_PHYSICIAN', name: 'Collaborating Physician', occupations: [] },
  { id: '2', code: 'SUPERVISING_PHYSICIAN', name: 'Supervising Physician', occupations: [] },
  { id: '3', code: 'MENTAL_HEALTH_COUNSELORS', name: 'Mental Health Counselors', occupations: [] },
  {
    id: '4',
    code: 'MEDICAL_DIRECTOR',
    name: 'Medical Director',
    // Single occupation by design ("Physician" was removed from the hierarchy)
    occupations: [
      {
        id: '4-1',
        supervisorTypeId: '4',
        name: 'Medical Doctor',
        specialties: [{ id: '4-1-1', occupationId: '4-1', name: 'Family Medicine' }],
        licenseTypes: [],
        degreeTypes: [],
      },
    ],
  },
]

const occupationOptions: SelectOption[] = [
  { label: 'Nurse Practitioner', value: '1' },
  { label: 'Physician Assistant', value: '2' },
  { label: 'Associate Clinical Social Worker', value: '3' },
]

function Harness({
  onForm,
  variant = 'supervisee',
}: {
  onForm: (form: UseFormReturn<SuperviseeFormValues>) => void
  variant?: SuperviseeSignupVariant
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const form = useForm<SuperviseeFormValues>({
    defaultValues:
      variant === 'need-medical-director'
        ? needMedicalDirectorDefaultValues
        : superviseeDefaultValues,
    shouldUnregister: false,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  onForm(form)

  return (
    <Form {...form}>
      {step === 1 ? (
        <SuperviseeStepSupervisionNeeds
          variant={variant}
          supervisorTypesData={supervisorTypesData}
          supervisorTypesLoading={false}
          occupationOptions={occupationOptions}
          occupationsLoading={false}
          stateOptions={[{ label: 'CA', value: 'CA' }]}
          howSoonOptions={[{ label: 'As soon as possible', value: 'IMMEDIATELY' }]}
          availabilityOptions={[{ label: 'Flexible', value: 'FLEXIBLE' }]}
          salaryRangeOptions={[{ label: '$0 - $50', value: '$0 - $50' }]}
          howSoonLoading={false}
          availabilityLoading={false}
          salaryRangesLoading={false}
          isSubmitting={false}
        />
      ) : (
        <SuperviseeStepProfileTerms isSubmitting={false} />
      )}
      <button type="button" data-testid="toggle-step" onClick={() => setStep(step === 1 ? 2 : 1)}>
        toggle-step
      </button>
    </Form>
  )
}

function renderHarness(variant?: SuperviseeSignupVariant) {
  let form!: UseFormReturn<SuperviseeFormValues>
  render(
    <Harness
      variant={variant}
      onForm={(f) => {
        form = f
      }}
    />,
  )
  return () => form
}

describe('SuperviseeStepSupervisionNeeds', () => {
  it('locks the supervision type selector until the occupation is filled', () => {
    renderHarness()
    expect(screen.getByText('Select your occupation first')).toBeInTheDocument()
  })

  it('clears an ineligible supervision type when the occupation changes', async () => {
    const getForm = renderHarness()

    await act(async () => {
      getForm().setValue('occupationId', '1') // Nurse Practitioner
      getForm().setValue('typeOfSupervisor', 'Collaborating Physician')
    })
    expect(getForm().getValues('typeOfSupervisor')).toBe('Collaborating Physician')

    await act(async () => {
      getForm().setValue('occupationId', '3') // Associate Clinical Social Worker — not NP-eligible
    })
    expect(getForm().getValues('typeOfSupervisor')).toBe('')
  })

  it('offers Medical Director as a checkbox that toggles needsMedicalDirector', async () => {
    const getForm = renderHarness()

    expect(screen.getByText('I need a Medical Director')).toBeInTheDocument()
    expect(getForm().getValues('needsMedicalDirector')).toBe(false)

    await act(async () => {
      screen.getByRole('checkbox').click()
    })
    expect(getForm().getValues('needsMedicalDirector')).toBe(true)

    await act(async () => {
      screen.getByRole('checkbox').click()
    })
    expect(getForm().getValues('needsMedicalDirector')).toBe(false)
  })

  it('keeps the Medical Director checkbox on regardless of occupation changes', async () => {
    const getForm = renderHarness()

    await act(async () => {
      getForm().setValue('occupationId', '3')
      getForm().setValue('needsMedicalDirector', true)
    })
    await act(async () => {
      getForm().setValue('occupationId', '2')
    })
    expect(getForm().getValues('needsMedicalDirector')).toBe(true)
  })

  it('preserves entered values when navigating between steps in the need-medical-director variant', async () => {
    const getForm = renderHarness('need-medical-director')

    await act(async () => {
      getForm().setValue('title', 'RN')
      getForm().setValue('occupationId', '1')
    })

    await act(async () => {
      screen.getByTestId('toggle-step').click()
    })
    await act(async () => {
      screen.getByTestId('toggle-step').click()
    })
    expect(getForm().getValues()).toMatchObject({
      title: 'RN',
      occupationId: '1',
      needsMedicalDirector: true,
    })
  })

  it('preserves entered values when navigating between step 2 and step 3', async () => {
    const getForm = renderHarness()

    await act(async () => {
      getForm().setValue('title', 'PA-C')
      getForm().setValue('occupationId', '2')
      getForm().setValue('typeOfSupervisor', 'Supervising Physician')
    })

    // Step 2 → Step 3
    await act(async () => {
      screen.getByTestId('toggle-step').click()
    })
    expect(screen.getByPlaceholderText('Describe your ideal supervisor…')).toBeInTheDocument()
    await act(async () => {
      getForm().setValue('description', 'Someone with plenty of experience mentoring PAs.')
    })

    // Step 3 → Step 2: everything entered on both steps survives the round trip
    await act(async () => {
      screen.getByTestId('toggle-step').click()
    })
    expect(screen.getByDisplayValue('PA-C')).toBeInTheDocument()
    expect(getForm().getValues()).toMatchObject({
      title: 'PA-C',
      occupationId: '2',
      typeOfSupervisor: 'Supervising Physician',
      description: 'Someone with plenty of experience mentoring PAs.',
    })
  })
})

describe('SuperviseeStepSupervisionNeeds — need-medical-director variant', () => {
  it('hides the supervision type select and the Medical Director checkbox', () => {
    const getForm = renderHarness('need-medical-director')

    expect(screen.queryByText('Type of Supervision Needed')).not.toBeInTheDocument()
    expect(screen.queryByText('I need a Medical Director')).not.toBeInTheDocument()
    expect(getForm().getValues('needsMedicalDirector')).toBe(true)
  })

  it('offers the Medical Director preference selects, unlocked and optional', () => {
    renderHarness('need-medical-director')

    expect(screen.getByText('Preferred Occupation (optional)')).toBeInTheDocument()
    expect(screen.getByText('Preferred Specialty (optional)')).toBeInTheDocument()
    expect(screen.getByText('Select preferred occupation')).toBeInTheDocument()
    expect(screen.queryByText('Select a type of supervision first')).not.toBeInTheDocument()
  })

  it('cascades the specialty options from the chosen preferred occupation', async () => {
    const getForm = renderHarness('need-medical-director')

    expect(screen.getByText('Select a preferred occupation first')).toBeInTheDocument()

    await act(async () => {
      getForm().setValue('supervisorOccupationId', 'Medical Doctor')
    })
    expect(screen.getByText('Select specialty')).toBeInTheDocument()

    await act(async () => {
      getForm().setValue('supervisorOccupationId', '')
    })
    expect(screen.getByText('Select a preferred occupation first')).toBeInTheDocument()
  })

  it('keeps the default variant unchanged (type select and checkbox still render)', () => {
    renderHarness()

    expect(screen.getByText('Type of Supervision Needed')).toBeInTheDocument()
    expect(screen.getByText('I need a Medical Director')).toBeInTheDocument()
  })
})
