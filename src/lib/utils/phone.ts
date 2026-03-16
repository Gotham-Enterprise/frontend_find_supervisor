import { parsePhoneNumberFromString } from 'libphonenumber-js'

const US_COUNTRY = 'US'

/** Max digits for US local format (area + exchange + subscriber). */
const US_LOCAL_DIGITS = 10

/**
 * Formats a raw phone string for display as (XXX) XXX-XXXX.
 * Accepts digits, spaces, dashes, parentheses, and optional leading +1.
 * Handles partial input gracefully.
 *
 * @param input - Raw string from user (typing or paste)
 * @returns Formatted display string, e.g. "(415) 555-1234"
 */
export function formatUSPhoneForDisplay(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 0) return ''

  // Allow leading 1 (US country code) but cap at 11 digits for display
  let toFormat = digits
  if (digits.startsWith('1') && digits.length > US_LOCAL_DIGITS) {
    toFormat = digits.slice(1, US_LOCAL_DIGITS + 1)
  } else if (digits.length > US_LOCAL_DIGITS) {
    toFormat = digits.slice(0, US_LOCAL_DIGITS)
  }

  if (toFormat.length <= 3) {
    return toFormat.length > 0 ? `(${toFormat}` : ''
  }
  if (toFormat.length <= 6) {
    return `(${toFormat.slice(0, 3)}) ${toFormat.slice(3)}`
  }
  return `(${toFormat.slice(0, 3)}) ${toFormat.slice(3, 6)}-${toFormat.slice(6)}`
}

/**
 * Validates that the input is a valid US phone number.
 * Supports common formats: (415) 555-1234, 415-555-1234, 4155551234, +1 415 555 1234
 *
 * @param input - Raw phone string from user input
 * @returns true if valid US number
 */
export function isValidUSPhoneNumber(input: string): boolean {
  if (!input?.trim()) return false
  const parsed = parsePhoneNumberFromString(input.trim(), US_COUNTRY)
  return parsed != null && parsed.isValid() && parsed.country === US_COUNTRY
}

/**
 * Validates and normalizes a US phone number to E.164 format.
 *
 * @param input - Raw phone string from user input
 * @returns E.164 string (e.g. "+14155551234") or null if invalid
 */
export function normalizeUSPhoneNumber(input: string): string | null {
  if (!input?.trim()) return null
  const parsed = parsePhoneNumberFromString(input.trim(), US_COUNTRY)
  if (parsed == null || !parsed.isValid() || parsed.country !== US_COUNTRY) {
    return null
  }
  return parsed.format('E.164')
}
