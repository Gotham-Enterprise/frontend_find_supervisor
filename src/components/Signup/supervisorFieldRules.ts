import type { ZodTypeAny } from 'zod'

import { type SupervisorFormValues, supervisorSchemaObject } from '@/components/Signup/schema'
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

      if (name === 'licenseType') {
        if (isPhysicianSupervisorType(supervisorType)) return true
        if (!String(value ?? '').trim()) return 'License type is required'
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
