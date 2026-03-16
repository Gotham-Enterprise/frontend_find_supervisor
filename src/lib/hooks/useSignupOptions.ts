import { useQuery } from '@tanstack/react-query'

import { fetchOptions, type OptionsParam, type SelectOption } from '@/lib/api/options'

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

  return {
    certificates,
    patientPopulations,
    licenseTypes,
    availability,
    isLoading:
      certificates.isLoading ||
      patientPopulations.isLoading ||
      licenseTypes.isLoading ||
      availability.isLoading,
    isError:
      certificates.isError ||
      patientPopulations.isError ||
      licenseTypes.isError ||
      availability.isError,
  }
}

export function useSuperviseeFormOptions() {
  const availability = useAvailabilityOptions()
  const howSoon = useHowSoonOptions()
  const supervisorTypes = useSupervisorTypeOptions()
  const salaryRanges = useSalaryRangesOptions()

  return {
    availability,
    howSoon,
    supervisorTypes,
    salaryRanges,
    isLoading:
      availability.isLoading ||
      howSoon.isLoading ||
      supervisorTypes.isLoading ||
      salaryRanges.isLoading,
    isError:
      availability.isError || howSoon.isError || supervisorTypes.isError || salaryRanges.isError,
  }
}
