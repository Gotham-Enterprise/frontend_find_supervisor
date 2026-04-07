import { apiClient } from './client'

export type SelectOption = { label: string; value: string }

type RawOption =
  | string
  | { label: string; value: string }
  | { name: string; id: string | number }
  | Record<string, unknown>

function normalizeOption(raw: RawOption): SelectOption {
  if (typeof raw === 'string') return { label: raw, value: raw }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'label' in raw &&
    'value' in raw &&
    typeof raw.label === 'string'
  ) {
    return { label: raw.label, value: String(raw.value) }
  }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'name' in raw &&
    'id' in raw &&
    typeof raw.name === 'string'
  ) {
    return { label: raw.name, value: String(raw.id) }
  }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'label' in raw &&
    ('min' in raw || 'max' in raw) &&
    typeof raw.label === 'string'
  ) {
    return { label: raw.label, value: raw.label }
  }
  return { label: String(raw), value: String(raw) }
}

export type OptionsParam =
  | 'certificate'
  | 'patientPopulation'
  | 'licenseType'
  | 'availability'
  | 'howSoon'
  | 'supervisorType'
  | 'salaryRanges'
  | 'format'
  | 'budgetType'

export async function fetchOptions(param: OptionsParam): Promise<SelectOption[]> {
  const { data: res } = await apiClient.get<{ success: boolean; data: RawOption[] }>(
    '/supervision/options',
    { params: { param } },
  )
  return Array.isArray(res.data) ? res.data.map(normalizeOption) : []
}

/**
 * GET /api/categories/specialties/occupation/:id — same source as frontend_job_finder
 * (`fetchSpecialtiesByOccupationApi`).
 */
export async function fetchSpecialtiesByOccupation(occupationId: string): Promise<SelectOption[]> {
  if (!occupationId) return []
  const { data: body } = await apiClient.get<{
    success: boolean
    data: { specialty: { id: number; name: string }[] }
  }>(`/categories/specialties/occupation/${occupationId}`)
  const list = body.data?.specialty ?? []
  return list.map((s) => ({ label: s.name, value: String(s.id) }))
}
