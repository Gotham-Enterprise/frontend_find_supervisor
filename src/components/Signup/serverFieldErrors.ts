import { getRawApiErrorMessage, parseApiError } from '@/lib/utils/error-parser'

export interface SignupServerFieldError {
  field: 'email' | 'contactNumber'
  message: string
}

const FIELD_ERROR_RULES: ReadonlyArray<{
  pattern: RegExp
  field: SignupServerFieldError['field']
}> = [
  { pattern: /email already exists/i, field: 'email' },
  { pattern: /invalid contact number/i, field: 'contactNumber' },
  { pattern: /contact number already exists/i, field: 'contactNumber' },
]

/**
 * Maps a register-API rejection to the signup field it belongs to, so the wizard
 * can set a persistent inline error and jump to the step that holds the field
 * (both live on step 1 of either signup form). Returns null for errors that
 * don't belong to a specific field — those stay toast-only.
 */
export function matchSignupServerFieldError(error: unknown): SignupServerFieldError | null {
  const raw = getRawApiErrorMessage(error)
  if (!raw) return null
  const rule = FIELD_ERROR_RULES.find((r) => r.pattern.test(raw))
  if (!rule) return null
  return { field: rule.field, message: parseApiError(error) }
}
