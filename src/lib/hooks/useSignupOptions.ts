import { useQuery } from '@tanstack/react-query'

import {
  fetchOptions,
  fetchSpecialtiesByOccupation,
  type OptionsParam,
  type SelectOption,
} from '@/lib/api/options'
import { useOccupations } from '@/lib/hooks/useCategories'

// Options rarely change — cache for 10 minutes
const STALE_TIME = 10 * 60 * 1000

function useSignupOption(param: OptionsParam) {
  return useQuery<SelectOption[]>({
    queryKey: ['signup-options', param],
    queryFn: () => fetchOptions(param),
    staleTime: STALE_TIME,
  })
}

export function useCertificateOptions() {
  return useSignupOption('certificate')
}

export function usePatientPopulationOptions() {
  return useSignupOption('patientPopulation')
}

export function useLicenseTypeOptions() {
  return useSignupOption('licenseType')
}

export function useAvailabilityOptions() {
  return useSignupOption('availability')
}

export function useHowSoonOptions() {
  return useSignupOption('howSoon')
}

export function useSupervisorTypeOptions() {
  return useSignupOption('supervisorType')
}

export function useSalaryRangesOptions() {
  return useSignupOption('salaryRanges')
}

/**
 * Occupation dropdown options from GET /api/categories/occupations (same as job_finder `useOccupations`).
 */
export function useOccupationOptions() {
  const q = useOccupations({ limit: 0 })
  return {
    ...q,
    data: q.data?.data?.map((o) => ({ label: o.name, value: String(o.id) })),
  }
}

/**
 * Fetches specialty options for a given occupation.
 * Mirrors the job_finder dependency pattern: disabled/empty until an
 * occupationId is selected, then re-queries automatically.
 */
export function useSpecialtiesByOccupation(occupationId: string) {
  return useQuery<SelectOption[]>({
    queryKey: ['signup-options', 'specialty', occupationId],
    queryFn: () => fetchSpecialtiesByOccupation(occupationId),
    enabled: occupationId.length > 0,
    staleTime: STALE_TIME,
  })
}

// ─── Composite hooks ──────────────────────────────────────────────────────────

export type SignupOptionsResult<T extends Record<string, ReturnType<typeof useSignupOption>>> =
  T & {
    isLoading: boolean
    isError: boolean
  }

export function useSupervisorFormOptions() {
  const certificates = useCertificateOptions()
  const patientPopulations = usePatientPopulationOptions()
  const licenseTypes = useLicenseTypeOptions()
  const availability = useAvailabilityOptions()
  const occupations = useOccupationOptions()

  return {
    certificates,
    patientPopulations,
    licenseTypes,
    availability,
    occupations,
    isLoading:
      certificates.isLoading ||
      patientPopulations.isLoading ||
      licenseTypes.isLoading ||
      availability.isLoading ||
      occupations.isLoading,
    isError:
      certificates.isError ||
      patientPopulations.isError ||
      licenseTypes.isError ||
      availability.isError ||
      occupations.isError,
  }
}

export function useSuperviseeFormOptions() {
  const availability = useAvailabilityOptions()
  const howSoon = useHowSoonOptions()
  const supervisorTypes = useSupervisorTypeOptions()
  const salaryRanges = useSalaryRangesOptions()
  const occupations = useOccupationOptions()

  return {
    availability,
    howSoon,
    supervisorTypes,
    salaryRanges,
    occupations,
    isLoading:
      availability.isLoading ||
      howSoon.isLoading ||
      supervisorTypes.isLoading ||
      salaryRanges.isLoading ||
      occupations.isLoading,
    isError:
      availability.isError ||
      howSoon.isError ||
      supervisorTypes.isError ||
      salaryRanges.isError ||
      occupations.isError,
  }
}
