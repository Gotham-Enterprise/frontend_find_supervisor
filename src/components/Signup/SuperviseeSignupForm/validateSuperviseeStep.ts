import type { UseFormClearErrors, UseFormGetValues, UseFormSetError } from 'react-hook-form'

import {
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  SUPERVISEE_SIGNUP_STEP_SCHEMAS,
  type SuperviseeFormValues,
} from '@/components/Signup/schema'

import { applyZodIssuesToForm } from '../SupervisorSignupForm/applyZodIssuesToForm'

export type SuperviseeSignupStepIndex = 0 | 1 | 2

export function validateSuperviseeStep(
  stepIndex: SuperviseeSignupStepIndex,
  getValues: UseFormGetValues<SuperviseeFormValues>,
  setError: UseFormSetError<SuperviseeFormValues>,
  clearErrors: UseFormClearErrors<SuperviseeFormValues>,
): boolean {
  const fields = SUPERVISEE_SIGNUP_STEP_FIELDS[stepIndex]
  clearErrors(fields as unknown as (keyof SuperviseeFormValues)[])

  const schema = SUPERVISEE_SIGNUP_STEP_SCHEMAS[stepIndex]
  const parsed = schema.safeParse(getValues())
  if (!parsed.success) {
    applyZodIssuesToForm(parsed.error, setError)
    return false
  }
  return true
}
