import type { UseFormClearErrors, UseFormGetValues, UseFormSetError } from 'react-hook-form'

import {
  SUPERVISOR_SIGNUP_STEP_FIELDS,
  SUPERVISOR_SIGNUP_STEP_SCHEMAS,
  type SupervisorFormValues,
} from '@/components/Signup/schema'

import { applyZodIssuesToForm } from './applyZodIssuesToForm'

export type SupervisorSignupStepIndex = 0 | 1 | 2

export function validateSupervisorStep(
  stepIndex: SupervisorSignupStepIndex,
  getValues: UseFormGetValues<SupervisorFormValues>,
  setError: UseFormSetError<SupervisorFormValues>,
  clearErrors: UseFormClearErrors<SupervisorFormValues>,
): boolean {
  const fields = SUPERVISOR_SIGNUP_STEP_FIELDS[stepIndex]
  clearErrors(fields as unknown as (keyof SupervisorFormValues)[])

  const schema = SUPERVISOR_SIGNUP_STEP_SCHEMAS[stepIndex]
  const parsed = schema.safeParse(getValues())
  if (!parsed.success) {
    applyZodIssuesToForm(parsed.error, setError)
    return false
  }
  return true
}
