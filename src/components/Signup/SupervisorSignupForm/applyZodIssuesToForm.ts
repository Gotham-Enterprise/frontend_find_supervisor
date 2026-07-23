import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import type { z } from 'zod'

/**
 * Maps Zod issues to react-hook-form `setError` so step-level and full-form validation
 * surface inline messages consistently. Returns the field paths that received errors
 * (used to route the user to the first step containing one).
 */
export function applyZodIssuesToForm<T extends FieldValues>(
  zodError: z.ZodError,
  setError: UseFormSetError<T>,
): FieldPath<T>[] {
  const paths: FieldPath<T>[] = []
  for (const issue of zodError.issues) {
    if (issue.path.length === 0) continue
    const path = issue.path.join('.') as FieldPath<T>
    setError(path, { type: 'manual', message: issue.message })
    paths.push(path)
  }
  return paths
}

/**
 * Earliest step index whose fields include one of the errored paths, or -1.
 * Nested paths ("licenses.0.state") match on their root field name.
 */
export function findFirstStepWithError(
  erroredPaths: readonly string[],
  stepFields: ReadonlyArray<ReadonlyArray<string>>,
): number {
  return stepFields.findIndex((fields) =>
    erroredPaths.some((path) => fields.includes(path.split('.')[0])),
  )
}
