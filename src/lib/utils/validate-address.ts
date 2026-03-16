import {
  validateAddress as validateAddressApi,
  type ValidateAddressResponse,
} from '@/lib/api/locations'

export interface AddressInput {
  city: string
  state: string
  zipcode: string
}

export interface ValidateAddressResult {
  valid: boolean
  message?: string
  /** Normalized city from API - use when proceeding with signup */
  suggestedCity?: string
  /** Normalized state from API - use when proceeding with signup */
  suggestedState?: string
}

/**
 * Validates address before signup. Reuses /api/locations/validate from backend_job_finder.
 * Returns a user-friendly result for the signup flow.
 */
export async function validateAddressForSignup(
  input: AddressInput,
): Promise<ValidateAddressResult> {
  try {
    const response: ValidateAddressResponse = await validateAddressApi({
      city: input.city,
      state: input.state,
      zipCode: input.zipcode,
    })

    if (!response.success || !response.data) {
      return {
        valid: false,
        message: 'The city and state could not be verified. Please check your location details.',
      }
    }

    const { city, state } = response.data

    // Backend validates city and state; both must be valid
    if (!city?.isValid || !state?.isValid) {
      return {
        valid: false,
        message: 'The city and state could not be verified. Please check your location details.',
      }
    }

    // Check if we have suggested corrections (normalized values differ from input)
    const hasSuggestedCity =
      city.value && city.value.toLowerCase().trim() !== input.city.toLowerCase().trim()
    const hasSuggestedState =
      state.value && state.value.toUpperCase().trim() !== input.state.toUpperCase().trim()

    if (hasSuggestedCity || hasSuggestedState) {
      const parts: string[] = []
      if (hasSuggestedCity) parts.push(`City: ${city.value}`)
      if (hasSuggestedState) parts.push(`State: ${state.value}`)
      return {
        valid: true,
        message: `We found a possible correction: ${parts.join(', ')}. Your registration will use these verified values.`,
        suggestedCity: city.value,
        suggestedState: state.value,
      }
    }

    return { valid: true }
  } catch {
    return {
      valid: false,
      message:
        'We could not verify your address right now. Please check your connection and try again.',
    }
  }
}
