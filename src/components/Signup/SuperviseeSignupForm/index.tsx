'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormState, useWatch } from 'react-hook-form'

import {
  needMedicalDirectorDefaultValues,
  superviseeDefaultValues,
} from '@/components/Signup/helpers'
import {
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  type SuperviseeFormValues,
  superviseeSchema,
} from '@/components/Signup/schema'
import { Form } from '@/components/ui/form'
import {
  useCitiesOptions,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSuperviseeSignup,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  filterSuperviseeOccupationOptions,
  INELIGIBLE_SUPERVISION_TYPE_MESSAGE,
  isSupervisorTypeEligibleForSupervisee,
} from '@/lib/utils/supervisee-eligibility'
import { validateAddressForSignup } from '@/lib/utils/validate-address'

import {
  applyZodIssuesToForm,
  findFirstStepWithError,
} from '../SupervisorSignupForm/applyZodIssuesToForm'
import { SuperviseeStepAccount } from './SuperviseeStepAccount'
import { SuperviseeStepIndicator } from './SuperviseeStepIndicator'
import { SuperviseeStepNavigation } from './SuperviseeStepNavigation'
import { SuperviseeStepProfileTerms } from './SuperviseeStepProfileTerms'
import { SuperviseeStepSupervisionNeeds } from './SuperviseeStepSupervisionNeeds'
import { type SuperviseeSignupStepIndex, validateSuperviseeStep } from './validateSuperviseeStep'

const LAST_STEP: SuperviseeSignupStepIndex = 1

export type SuperviseeSignupVariant = 'supervisee' | 'need-medical-director'

type SuperviseeSignupFormProps = {
  /** 'need-medical-director' presets needsMedicalDirector and hides the supervision-type UI. */
  variant?: SuperviseeSignupVariant
}

export function SuperviseeSignupForm({ variant = 'supervisee' }: SuperviseeSignupFormProps) {
  const isNeedMedicalDirector = variant === 'need-medical-director'
  const [step, setStep] = useState<SuperviseeSignupStepIndex>(0)
  const stepRef = useRef(step)
  stepRef.current = step

  const [isAdvancing, setIsAdvancing] = useState(false)
  const advanceInFlightRef = useRef(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const { mutate: signup, isPending } = useSuperviseeSignup()

  const {
    availability: { data: availabilityOptions = [], isLoading: availabilityLoading },
    howSoon: { data: howSoonOptions = [], isLoading: howSoonLoading },
    supervisorTypesData: { data: supervisorTypesData = [], isLoading: supervisorTypesLoading },
    salaryRanges: { data: salaryRangeOptions = [], isLoading: salaryRangesLoading },
    occupations: { data: occupationOptions = [], isLoading: occupationsLoading },
    isError: optionsError,
  } = useSuperviseeFormOptions()

  // Regular supervisees pick from the allowlisted occupations (associate-level
  // mental health counselors, NPs, and PAs); the Medical Director flow is open
  // to any occupation — its typical clients (med spa owners, RNs, etc.) are
  // outside the supervisee allowlist.
  const superviseeOccupationOptions = useMemo(
    () =>
      isNeedMedicalDirector
        ? occupationOptions
        : filterSuperviseeOccupationOptions(occupationOptions),
    [isNeedMedicalDirector, occupationOptions],
  )

  const form = useForm<SuperviseeFormValues>({
    defaultValues: isNeedMedicalDirector
      ? needMedicalDirectorDefaultValues
      : superviseeDefaultValues,
    shouldUnregister: false,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const stateValue = useWatch({ control: form.control, name: 'state' }) ?? ''
  const agreedToPost = useWatch({ control: form.control, name: 'agreedToPost' })
  const agreedToTerms = useWatch({ control: form.control, name: 'agreedToTerms' })

  const {
    data: stateOptions = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useStatesOptions()
  const {
    data: cityOptions = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = useCitiesOptions(stateValue)

  const canSubmit = Boolean(agreedToPost && agreedToTerms)
  const locationOptionsError = statesError || citiesError
  const { isSubmitting: formIsSubmitting } = useFormState({ control: form.control })
  const isSubmitting = formIsSubmitting || isPending

  useEffect(() => {
    form.setValue('city', '')
  }, [stateValue, form])

  async function handleNext() {
    const currentStep = stepRef.current
    if (currentStep >= LAST_STEP) return
    if (advanceInFlightRef.current) return
    advanceInFlightRef.current = true
    setIsAdvancing(true)
    try {
      const ok = validateSuperviseeStep(
        currentStep,
        form.getValues,
        form.setError,
        form.clearErrors,
      )
      if (!ok) return

      if (currentStep === 0) {
        setIsValidatingAddress(true)
        let addressResult
        try {
          const values = form.getValues()
          addressResult = await validateAddressForSignup({
            city: values.city,
            state: values.state,
            zipcode: values.zipcode,
          })
        } finally {
          setIsValidatingAddress(false)
        }

        if (!addressResult.valid) {
          showError(addressResult.message ?? 'Please check your address and try again.')
          return
        }
      }

      setStep((s) => Math.min(s + 1, LAST_STEP) as SuperviseeSignupStepIndex)
    } finally {
      advanceInFlightRef.current = false
      setIsAdvancing(false)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1) as SuperviseeSignupStepIndex)
  }

  async function onSubmit(values: SuperviseeFormValues) {
    if (stepRef.current !== LAST_STEP) return

    const parsed = superviseeSchema.safeParse(values)
    if (!parsed.success) {
      const erroredPaths = applyZodIssuesToForm(parsed.error, form.setError)
      // Errors can land on fields from earlier steps (unmounted) — jump there so the
      // submit never silently does nothing.
      const errorStep = findFirstStepWithError(erroredPaths, SUPERVISEE_SIGNUP_STEP_FIELDS)
      if (errorStep >= 0 && errorStep !== stepRef.current) {
        setStep(errorStep as SuperviseeSignupStepIndex)
      }
      showError('Please review the highlighted fields.')
      return
    }

    // Defense-in-depth: the Step 2 UI only offers eligible types, but re-check before
    // submitting in case the selection was made before the occupation changed.
    const selectedType = supervisorTypesData.find((t) => t.name === values.typeOfSupervisor)
    const occupationName =
      superviseeOccupationOptions.find((o) => o.value === values.occupationId)?.label ?? ''
    if (selectedType && !isSupervisorTypeEligibleForSupervisee(selectedType, occupationName)) {
      form.setError('typeOfSupervisor', {
        type: 'manual',
        message: INELIGIBLE_SUPERVISION_TYPE_MESSAGE,
      })
      const errorStep = findFirstStepWithError(['typeOfSupervisor'], SUPERVISEE_SIGNUP_STEP_FIELDS)
      if (errorStep >= 0) setStep(errorStep as SuperviseeSignupStepIndex)
      showError(INELIGIBLE_SUPERVISION_TYPE_MESSAGE)
      return
    }

    signup(values, {
      onSuccess: () => {
        showSuccess(
          'Your account has been created. Please check your email to verify your address before logging in.',
        )
      },
      onError: (error) => {
        showError(parseApiError(error))
      },
    })
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (stepRef.current !== LAST_STEP) {
            void handleNext()
            return
          }
          void form.handleSubmit(onSubmit)(e)
        }}
      >
        {optionsError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Some options failed to load. Please refresh the page.
          </p>
        )}
        {locationOptionsError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {statesError
              ? 'Unable to load states right now.'
              : 'Unable to load cities for the selected state.'}{' '}
            Please refresh the page.
          </p>
        )}

        <SuperviseeStepIndicator currentStep={step} />

        {step === 0 && (
          <SuperviseeStepAccount
            stateOptions={stateOptions}
            cityOptions={cityOptions}
            statesLoading={statesLoading}
            citiesLoading={citiesLoading}
            statesError={statesError}
            citiesError={citiesError}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 1 && (
          <>
            <SuperviseeStepSupervisionNeeds
              variant={variant}
              supervisorTypesData={supervisorTypesData}
              supervisorTypesLoading={supervisorTypesLoading}
              occupationOptions={superviseeOccupationOptions}
              occupationsLoading={occupationsLoading}
              stateOptions={stateOptions}
              howSoonOptions={howSoonOptions}
              availabilityOptions={availabilityOptions}
              salaryRangeOptions={salaryRangeOptions}
              howSoonLoading={howSoonLoading}
              availabilityLoading={availabilityLoading}
              salaryRangesLoading={salaryRangesLoading}
              isSubmitting={isSubmitting}
            />
            <SuperviseeStepProfileTerms isSubmitting={isSubmitting} />
          </>
        )}

        <SuperviseeStepNavigation
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          isAdvancing={isAdvancing}
          isPending={isPending}
          isSubmitting={isSubmitting}
          isValidatingAddress={isValidatingAddress}
          canSubmit={canSubmit}
        />
      </form>
    </Form>
  )
}
