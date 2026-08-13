import type { ZodTypeAny } from 'zod'

import {
  licenseEntrySchema,
  type LicenseEntryValues,
  type SupervisorFormValues,
  supervisorSchemaObject,
} from '@/components/Signup/schema'
import { isPhysicianSupervisorType, isValidPhysicianDegreeType } from '@/lib/utils/supervisor-type'

/**
 * Per-field `rules` for Controller so RHF validates after touch (`mode: 'onTouched'`) and
 * re-validates on change (`reValidateMode: 'onChange'`), including clearing manual `setError`
 * from step validation when the value becomes valid. Use on each step field that mirrors Zod.
 */
export function supervisorFieldRules<N extends keyof SupervisorFormValues>(name: N) {
  return {
    validate: (value: unknown, formValues: SupervisorFormValues): true | string => {
      const supervisorType = formValues?.supervisorType ?? ''

      if (name === 'degreeType') {
        if (!isPhysicianSupervisorType(supervisorType)) return true
        if (!String(value ?? '').trim()) return 'Degree type is required'
        if (!isValidPhysicianDegreeType(String(value))) return 'Degree type must be MD or DO'
        return true
      }

      if (name === 'certifications') {
        if (isPhysicianSupervisorType(supervisorType)) return true
        if (!Array.isArray(value) || value.length === 0) {
          return 'Add at least one certification'
        }
        return true
      }

      const fieldSchema = supervisorSchemaObject.shape[name] as ZodTypeAny | undefined
      if (!fieldSchema) return true
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}

/**
 * Minimal form shape shared by every form that hosts a `licenses` field array
 * (supervisor signup + supervisor profile edit).
 */
export type LicensesFormShape = {
  supervisorType: string
  licenses: LicenseEntryValues[]
}

/**
 * Per-field `rules` for Controllers inside the `licenses` field array
 * (`licenses.${index}.<field>`), which `supervisorFieldRules` cannot address
 * (it is keyed by top-level fields). `licenseType` is only required for
 * non-physicians; physicians use the shared top-level `degreeType`.
 */
export function licenseEntryFieldRules<N extends keyof LicenseEntryValues>(name: N) {
  return {
    validate: (value: unknown, formValues: LicensesFormShape): true | string => {
      if (name === 'licenseType') {
        const supervisorType = formValues?.supervisorType ?? ''
        if (isPhysicianSupervisorType(supervisorType)) return true
        if (!String(value ?? '').trim()) return 'License type is required'
        return true
      }

      const fieldSchema = licenseEntrySchema.shape[name] as ZodTypeAny | undefined
      if (!fieldSchema) return true
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}
