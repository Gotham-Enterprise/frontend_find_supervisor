import type { ZodTypeAny } from 'zod'

import { type SuperviseeFormValues, superviseeSchema } from '@/components/Signup/schema'

/**
 * Per-field `rules` for Controller so RHF validates after touch (`mode: 'onTouched'`) and
 * re-validates on change (`reValidateMode: 'onChange'`), including clearing manual `setError`
 * from step validation when the value becomes valid.
 */
export function superviseeFieldRules<N extends keyof SuperviseeFormValues>(name: N) {
  return {
    validate: (value: unknown): true | string => {
      const fieldSchema = superviseeSchema.shape[name] as ZodTypeAny | undefined
      if (!fieldSchema) return true
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}
