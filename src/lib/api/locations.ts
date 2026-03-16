import { apiClient } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Backend state shape from /api/categories/us_states (backend_job_finder) */
export interface StateApi {
  id: string
  name: string
  abbreviation: string
}

/** Backend city shape from /api/categories/us_state_cities (backend_job_finder) */
export interface CityApi {
  id: number
  name: string
}

/** Normalized option for Select components */
export interface SelectOption {
  label: string
  value: string
}

export interface ValidateAddressRequest {
  address?: string
  city: string
  state: string
  zipCode?: string
}

export interface ValidateAddressFieldResult {
  value: string
  isValid: boolean
}

export interface ValidateAddressResponse {
  success: boolean
  data: {
    address?: ValidateAddressFieldResult
    city: ValidateAddressFieldResult
    state: ValidateAddressFieldResult
    zipCode?: ValidateAddressFieldResult
  }
}

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Validate address via backend /api/locations/validate.
 * Uses Nominatim (OpenStreetMap) to verify city and state.
 * Reuses the same contract as frontend_job_finder.
 */
export async function validateAddress(
  address: ValidateAddressRequest,
): Promise<ValidateAddressResponse> {
  const { data } = await apiClient.post<ValidateAddressResponse>('/locations/validate', {
    address: address.address ?? '',
    city: address.city,
    state: address.state,
    zipCode: address.zipCode ?? '',
  })
  return data
}

// ─── States & Cities (reused from frontend_job_finder /api/categories) ────────

interface StatesApiResponse {
  success: boolean
  data: { states: StateApi[]; count: number }
}

interface CitiesApiResponse {
  success: boolean
  data: { state: string; cities: CityApi[]; count: number }
}

/**
 * Fetch US states from backend. Reuses /api/categories/us_states from backend_job_finder.
 * Returns options normalized for Select components (value = abbreviation, label = "Name (AB)").
 */
export async function fetchStatesApi(): Promise<SelectOption[]> {
  try {
    const { data } = await apiClient.get<StatesApiResponse>('/categories/us_states')
    if (!data?.success || !Array.isArray(data.data?.states)) {
      throw new Error('Invalid states response')
    }
    return data.data.states.map((s) => ({
      label: `${s.name} (${s.abbreviation})`,
      value: s.abbreviation,
    }))
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Unable to load states right now.')
  }
}

/**
 * Fetch cities for a state from backend. Reuses /api/categories/us_state_cities from backend_job_finder.
 * Requires a valid state abbreviation (e.g. "CA").
 */
export async function fetchCitiesApi(stateCode: string): Promise<SelectOption[]> {
  if (!stateCode?.trim()) {
    throw new Error('Select a state first.')
  }
  try {
    const { data } = await apiClient.get<CitiesApiResponse>(
      `/categories/us_state_cities?state=${encodeURIComponent(stateCode.trim())}`,
    )
    if (!data?.success || !Array.isArray(data.data?.cities)) {
      throw new Error('Invalid cities response')
    }
    return data.data.cities.map((c) => ({
      label: c.name,
      value: c.name,
    }))
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Unable to load cities for the selected state.',
    )
  }
}
