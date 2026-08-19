import type { UseFormClearErrors, UseFormGetValues, UseFormSetError } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

import {
  type MedicalDirectorFormValues,
  SUPERVISOR_SIGNUP_STEP_FIELDS,
  SUPERVISOR_SIGNUP_STEP_SCHEMAS,
} from '@/components/Signup/schema'

import { applyZodIssuesToForm } from './applyZodIssuesToForm'

export type SupervisorSignupStepIndex = 0 | 1 | 2

/**
 * Typed against the superset MedicalDirectorFormValues so both
 * SupervisorSignupForm variants share it; the defaults keep plain supervisor
 * call sites unchanged, the Medical Director variant passes its own
 * step schemas/fields.
 */
export function validateSupervisorStep(
  stepIndex: SupervisorSignupStepIndex,
  getValues: UseFormGetValues<MedicalDirectorFormValues>,
  setError: UseFormSetError<MedicalDirectorFormValues>,
  clearErrors: UseFormClearErrors<MedicalDirectorFormValues>,
  stepSchemas: ReadonlyArray<ZodTypeAny> = SUPERVISOR_SIGNUP_STEP_SCHEMAS,
  stepFields: ReadonlyArray<ReadonlyArray<string>> = SUPERVISOR_SIGNUP_STEP_FIELDS,
): boolean {
  const fields = stepFields[stepIndex]
  clearErrors(fields as unknown as (keyof MedicalDirectorFormValues)[])

  const schema = stepSchemas[stepIndex]
  const parsed = schema.safeParse(getValues())
  if (!parsed.success) {
    applyZodIssuesToForm(parsed.error, setError)
    return false
  }
  return true
}
