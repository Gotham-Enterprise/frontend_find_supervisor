'use client'

import { useMemo, useState } from 'react'

import {
  useAvailabilityOptions,
  useLicenseTypeOptions,
  useMergedSpecialtyOptions,
  useOccupations,
  useStatesOptions,
  useSuperviseeProfile,
  useSupervisorSearch,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

import { DEFAULT_FILTERS, SUPERVISOR_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import { mergeSuperviseeProfileIntoSearchFilters } from './superviseeSearchDefaults'
import type { SortOption, SupervisorSearchFilters, SupervisorSearchResult } from './types'

// Client-side sort is only used for experience_asc — all other options are
// handled server-side via the sortBy API param.
function sortSupervisorsLocal(
  list: SupervisorSearchResult[],
  sortBy: SortOption,
): SupervisorSearchResult[] {
  if (sortBy !== 'experience_asc') return list
  const copy = [...list]
  const exp = (s: SupervisorSearchResult) => {
    const n = parseInt(String(s.yearsOfExperience).replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? n : 0
  }
  return copy.sort((a, b) => exp(a) - exp(b))
}

export function SearchSupervisorPage() {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [filters, setFilters] = useState<SupervisorSearchFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<SupervisorSearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('best_match')
  const [page, setPage] = useState(1)
  const [defaultsSeeded, setDefaultsSeeded] = useState(false)
  const [prefillFromProfile, setPrefillFromProfile] = useState(false)

  const { data: superviseeProfile, isFetched: superviseeProfileFetched } = useSuperviseeProfile()
  const licenseTypesQuery = useLicenseTypeOptions()
  const statesQuery = useStatesOptions()
  const availabilityQuery = useAvailabilityOptions()

  const licenseTypeOptions = useMemo(() => licenseTypesQuery.data ?? [], [licenseTypesQuery.data])
  const stateOptions = useMemo(() => statesQuery.data ?? [], [statesQuery.data])
  const availabilityOptions = useMemo(() => availabilityQuery.data ?? [], [availabilityQuery.data])

  const optionsReady =
    superviseeProfileFetched &&
    licenseTypesQuery.isFetched &&
    statesQuery.isFetched &&
    availabilityQuery.isFetched

  const profileMergedDefaults = useMemo(
    () =>
      mergeSuperviseeProfileIntoSearchFilters(
        superviseeProfile ?? undefined,
        DEFAULT_FILTERS,
        licenseTypeOptions,
        stateOptions,
        availabilityOptions,
      ),
    [superviseeProfile, licenseTypeOptions, stateOptions, availabilityOptions],
  )

  // Mark options as ready once all data is loaded (filters always start blank).
  if (optionsReady && !defaultsSeeded) {
    setDefaultsSeeded(true)
  }

  function handlePrefillToggle(enabled: boolean) {
    setPrefillFromProfile(enabled)
    const next = enabled ? profileMergedDefaults : DEFAULT_FILTERS
    setFilters(next)
    setAppliedFilters(next)
    setPage(1)
  }

  const { data: occupationsRes } = useOccupations({ limit: 0 })
  const { options: appliedSpecialtyOptions } = useMergedSpecialtyOptions(
    appliedFilters.occupationIds,
  )

  const occupationNames = useMemo(() => {
    return appliedFilters.occupationIds
      .map((id) => occupationsRes?.data?.find((o) => String(o.id) === id)?.name?.trim())
      .filter((n): n is string => Boolean(n))
  }, [appliedFilters.occupationIds, occupationsRes?.data])

  const specialtyNames = useMemo(() => {
    return appliedFilters.specialtyIds
      .map((id) => appliedSpecialtyOptions.find((s) => s.value === id)?.label?.trim())
      .filter((n): n is string => Boolean(n))
  }, [appliedFilters.specialtyIds, appliedSpecialtyOptions])

  const searchInput = useMemo(
    () => ({
      page,
      limit: SUPERVISOR_SEARCH_PAGE_SIZE,
      keywords: appliedKeyword,
      filters: appliedFilters,
      occupationNames,
      specialtyNames,
      sortBy,
    }),
    [page, appliedKeyword, appliedFilters, occupationNames, specialtyNames, sortBy],
  )

  const { data, isLoading, isError, error, refetch } = useSupervisorSearch(
    searchInput,
    defaultsSeeded,
  )

  const supervisors = useMemo(() => {
    const raw = data?.results ?? []
    return sortSupervisorsLocal(raw, sortBy)
  }, [data?.results, sortBy])

  const total = data?.meta?.totalCount ?? 0

  const errorMessage = isError
    ? parseApiError(error) || 'Something went wrong while loading supervisors.'
    : null

  function handleSearch() {
    setAppliedKeyword(keyword.trim())
    setAppliedFilters(filters)
    setPage(1)
  }

  function handleFiltersChange(next: SupervisorSearchFilters) {
    setFilters(next)
  }

  function handleApplyFilters() {
    setAppliedFilters(filters)
    setPage(1)
  }

  function handleResetSearch() {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setKeyword('')
    setAppliedKeyword('')
    setPage(1)
  }

  function handleClearFilterPanel() {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  return (
    <div className="flex h-[calc(100vh-60px-4rem)] min-h-0 flex-col overflow-hidden">
      <div className="px-3 shrink-0 border-b border-border pb-6 pt-0">
        <SearchSupervisorHeader
          keyword={keyword}
          supervisionFormats={filters.supervisionFormats}
          onKeywordChange={setKeyword}
          onSupervisionFormatsChange={(next) =>
            setFilters({ ...filters, supervisionFormats: next })
          }
          onSearch={handleSearch}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden py-6 lg:grid lg:min-h-0 lg:grid-cols-[280px_1fr] lg:gap-8 lg:py-8">
        <div className="min-h-0 max-h-[min(42vh,380px)] shrink-0 overflow-y-auto border-b border-border px-3 pb-4 lg:max-h-none lg:border-b-0 lg:pb-0">
          <SearchSupervisorFilters
            filters={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onClearFilters={handleClearFilterPanel}
            prefillFromProfile={prefillFromProfile}
            onPrefillToggle={handlePrefillToggle}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SearchSupervisorResults
            supervisors={supervisors}
            total={total}
            page={page}
            pageSize={SUPERVISOR_SEARCH_PAGE_SIZE}
            sortBy={sortBy}
            isLoading={!defaultsSeeded || isLoading}
            errorMessage={errorMessage}
            onRetry={() => void refetch()}
            onPageChange={setPage}
            onSortChange={(next) => {
              setSortBy(next)
              setPage(1)
            }}
            onClearFilters={handleResetSearch}
          />
        </div>
      </div>
    </div>
  )
}
