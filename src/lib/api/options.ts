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

export async function fetchOptions(param: OptionsParam): Promise<SelectOption[]> {
  const { data: res } = await apiClient.get<{ success: boolean; data: RawOption[] }>(
    '/supervision/options',
    { params: { param } },
  )
  return Array.isArray(res.data) ? res.data.map(normalizeOption) : []
}
