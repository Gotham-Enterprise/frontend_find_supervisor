'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useFormState, useWatch } from 'react-hook-form'

import {
  medicalDirectorDefaultValues,
  supervisorSignupDefaultValues,
} from '@/components/Signup/helpers'
import {
  MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
  MEDICAL_DIRECTOR_SIGNUP_STEP_SCHEMAS,
  type MedicalDirectorFormValues,
  medicalDirectorSchema,
  SUPERVISOR_SIGNUP_STEP_FIELDS,
  SUPERVISOR_SIGNUP_STEP_SCHEMAS,
  supervisorSchema,
} from '@/components/Signup/schema'
import { Form } from '@/components/ui/form'
import {
  useCitiesOptions,
  useStatesOptions,
  useSupervisorFormOptions,
  useSupervisorSignup,
  useSupervisorTypesData,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { isMedicalDirectorType } from '@/lib/utils/supervisee-eligibility'
import { validateAddressForSignup } from '@/lib/utils/validate-address'

import { applyZodIssuesToForm, findFirstStepWithError } from './applyZodIssuesToForm'
import { MedicalDirectorStepLicenseCredentials } from './MedicalDirectorStepLicenseCredentials'
import { SupervisorStepAccount } from './SupervisorStepAccount'
import { SupervisorStepIndicator } from './SupervisorStepIndicator'
import { SupervisorStepLicenseCredentials } from './SupervisorStepLicenseCredentials'
import { SupervisorStepNavigation } from './SupervisorStepNavigation'
import { SupervisorStepPracticeDetails } from './SupervisorStepPracticeDetails'
import { type SupervisorSignupStepIndex, validateSupervisorStep } from './validateSupervisorStep'

const LAST_STEP: SupervisorSignupStepIndex = 2

export type SupervisorSignupVariant = 'supervisor' | 'medical-director'

type SupervisorSignupFormProps = {
  /** 'medical-director' presets the supervisor type and adds the offerings step-2 UI. */
  variant?: SupervisorSignupVariant
}

export function SupervisorSignupForm({ variant = 'supervisor' }: SupervisorSignupFormProps) {
  const isMedicalDirector = variant === 'medical-director'
  const fullSchema = isMedicalDirector ? medicalDirectorSchema : supervisorSchema
  const stepSchemas = isMedicalDirector
    ? MEDICAL_DIRECTOR_SIGNUP_STEP_SCHEMAS
    : SUPERVISOR_SIGNUP_STEP_SCHEMAS
  const stepFields = isMedicalDirector
    ? MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS
    : SUPERVISOR_SIGNUP_STEP_FIELDS

  const [step, setStep] = useState<SupervisorSignupStepIndex>(0)
  /** Always read current step in submit/keyboard handlers (avoids stale closure vs `step` state). */
  const stepRef = useRef(step)
  stepRef.current = step

  const [isAdvancing, setIsAdvancing] = useState(false)
  /** Prevents double Next clicks from incrementing step past LAST_STEP before React re-renders (would trigger signup). */
  const advanceInFlightRef = useRef(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const { mutate: signup, isPending } = useSupervisorSignup()

  const {
    certificates: { data: certificateOptions = [], isLoading: certificatesLoading },
    patientPopulations: {
      data: patientPopulationOptions = [],
      isLoading: patientPopulationsLoading,
    },
    availability: { data: availabilityOptions = [], isLoading: availabilityLoading },
    isError: optionsError,
  } = useSupervisorFormOptions()

  const { data: supervisorTypesData = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypesData()
  // Medical Director has its own dedicated signup path — keep it out of the
  // regular flow's dropdown (the full hierarchy stays available for cascades).
  const supervisorTypeOptions = supervisorTypesData
    .filter((t) => !isMedicalDirectorType(t))
    .map((t) => ({ label: t.name, value: t.name }))

  const form = useForm<MedicalDirectorFormValues>({
    defaultValues: isMedicalDirector ? medicalDirectorDefaultValues : supervisorSignupDefaultValues,
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
      const ok = validateSupervisorStep(
        currentStep,
        form.getValues,
        form.setError,
        form.clearErrors,
        stepSchemas,
        stepFields,
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

      setStep((s) => Math.min(s + 1, LAST_STEP) as SupervisorSignupStepIndex)
    } finally {
      advanceInFlightRef.current = false
      setIsAdvancing(false)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1) as SupervisorSignupStepIndex)
  }

  async function onSubmit(values: MedicalDirectorFormValues) {
    if (stepRef.current !== LAST_STEP) return

    const parsed = fullSchema.safeParse(values)
    if (!parsed.success) {
      const erroredPaths = applyZodIssuesToForm(parsed.error, form.setError)
      // Errors can land on fields from earlier steps (unmounted) — jump there so the
      // submit never silently does nothing.
      const errorStep = findFirstStepWithError(erroredPaths, stepFields)
      if (errorStep >= 0 && errorStep !== stepRef.current) {
        setStep(errorStep as SupervisorSignupStepIndex)
      }
      showError('Please review the highlighted fields.')
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
          // Use stepRef so Enter-key submit never sees a stale `step` and calls register early.
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

        <SupervisorStepIndicator currentStep={step} />

        {step === 0 && (
          <SupervisorStepAccount
            stateOptions={stateOptions}
            cityOptions={cityOptions}
            statesLoading={statesLoading}
            citiesLoading={citiesLoading}
            statesError={statesError}
            citiesError={citiesError}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 1 &&
          (isMedicalDirector ? (
            <MedicalDirectorStepLicenseCredentials
              supervisorTypesData={supervisorTypesData}
              stateOptions={stateOptions}
              supervisorTypesLoading={supervisorTypesLoading}
              isSubmitting={isSubmitting}
            />
          ) : (
            <SupervisorStepLicenseCredentials
              supervisorTypeOptions={supervisorTypeOptions}
              supervisorTypesData={supervisorTypesData}
              certificateOptions={certificateOptions}
              stateOptions={stateOptions}
              supervisorTypesLoading={supervisorTypesLoading}
              certificatesLoading={certificatesLoading}
              isSubmitting={isSubmitting}
            />
          ))}
        {step === 2 && (
          <SupervisorStepPracticeDetails
            patientPopulationOptions={patientPopulationOptions}
            availabilityOptions={availabilityOptions}
            patientPopulationsLoading={patientPopulationsLoading}
            availabilityLoading={availabilityLoading}
            isSubmitting={isSubmitting}
            isMedicalDirector={isMedicalDirector}
          />
        )}

        <SupervisorStepNavigation
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          isAdvancing={isAdvancing}
          isPending={isPending}
          isSubmitting={isSubmitting}
          isValidatingAddress={isValidatingAddress}
          canSubmit={canSubmit}
          submitLabel={isMedicalDirector ? 'Sign Up as Medical Director →' : undefined}
        />
      </form>
    </Form>
  )
}
