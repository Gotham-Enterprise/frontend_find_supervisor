import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import type { z } from 'zod'

/**
 * Maps Zod issues to react-hook-form `setError` so step-level and full-form validation
 * surface inline messages consistently.
 */
export function applyZodIssuesToForm<T extends FieldValues>(
  zodError: z.ZodError,
  setError: UseFormSetError<T>,
) {
  for (const issue of zodError.issues) {
    if (issue.path.length === 0) continue
    const path = issue.path.join('.') as FieldPath<T>
    setError(path, { type: 'manual', message: issue.message })
  }
}
