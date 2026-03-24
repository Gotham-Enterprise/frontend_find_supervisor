'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { superviseeDefaultValues } from '@/components/Signup/helpers'
import { type SuperviseeFormValues, superviseeSchema } from '@/components/Signup/schema'
import { Form } from '@/components/ui/form'
import {
  useCitiesOptions,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSuperviseeSignup,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { validateAddressForSignup } from '@/lib/utils/validate-address'

import { applyZodIssuesToForm } from '../SupervisorSignupForm/applyZodIssuesToForm'
import { SuperviseeStepAccount } from './SuperviseeStepAccount'
import { SuperviseeStepIndicator } from './SuperviseeStepIndicator'
import { SuperviseeStepNavigation } from './SuperviseeStepNavigation'
import { SuperviseeStepProfileTerms } from './SuperviseeStepProfileTerms'
import { SuperviseeStepSupervisionNeeds } from './SuperviseeStepSupervisionNeeds'
import { type SuperviseeSignupStepIndex, validateSuperviseeStep } from './validateSuperviseeStep'

const LAST_STEP: SuperviseeSignupStepIndex = 2

export function SuperviseeSignupForm() {
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
    supervisorTypes: { data: supervisorTypeOptions = [], isLoading: supervisorTypesLoading },
    salaryRanges: { data: salaryRangeOptions = [], isLoading: salaryRangesLoading },
    isError: optionsError,
  } = useSuperviseeFormOptions()

  const form = useForm<SuperviseeFormValues>({
    defaultValues: superviseeDefaultValues,
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
      applyZodIssuesToForm(parsed.error, form.setError)
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
          />
        )}
        {step === 1 && (
          <SuperviseeStepSupervisionNeeds
            stateOptions={stateOptions}
            supervisorTypeOptions={supervisorTypeOptions}
            howSoonOptions={howSoonOptions}
            availabilityOptions={availabilityOptions}
            salaryRangeOptions={salaryRangeOptions}
            statesLoading={statesLoading}
            supervisorTypesLoading={supervisorTypesLoading}
            howSoonLoading={howSoonLoading}
            availabilityLoading={availabilityLoading}
            salaryRangesLoading={salaryRangesLoading}
          />
        )}
        {step === 2 && <SuperviseeStepProfileTerms />}

        <SuperviseeStepNavigation
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          isAdvancing={isAdvancing}
          isPending={isPending}
          isValidatingAddress={isValidatingAddress}
          canSubmit={canSubmit}
        />
      </form>
    </Form>
  )
}
