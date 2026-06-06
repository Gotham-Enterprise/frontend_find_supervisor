'use client'

import { useMemo, useState } from 'react'

import {
  useOccupationOptions,
  useStatesOptions,
  useSuperviseeSearch,
  useSupervisorProfile,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

import { DEFAULT_FILTERS, SUPERVISEE_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSuperviseeFilters } from './SearchSuperviseeFilters'
import { SearchSuperviseeHeader } from './SearchSuperviseeHeader'
import { SearchSuperviseeResults } from './SearchSuperviseeResults'
import { mergeSupervisorProfileIntoSearchFilters } from './supervisorSearchDefaults'
import type { SortOption, SuperviseeSearchFilters } from './types'

export function SearchSuperviseePage() {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [filters, setFilters] = useState<SuperviseeSearchFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<SuperviseeSearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('best_match')
  const [page, setPage] = useState(1)
  const [prefillFromProfile, setPrefillFromProfile] = useState(false)

  const { data: supervisorProfile, isFetched: supervisorProfileFetched } = useSupervisorProfile()
  const statesQuery = useStatesOptions()
  const occupationsQuery = useOccupationOptions()

  const stateOptions = useMemo(() => statesQuery.data ?? [], [statesQuery.data])
  const occupationOptions = useMemo(() => occupationsQuery.data ?? [], [occupationsQuery.data])

  const optionsReady =
    supervisorProfileFetched && statesQuery.isFetched && occupationsQuery.isFetched

  const profileMergedDefaults = useMemo(
    () =>
      mergeSupervisorProfileIntoSearchFilters(
        supervisorProfile ?? undefined,
        DEFAULT_FILTERS,
        stateOptions,
        occupationOptions,
      ),
    [supervisorProfile, stateOptions, occupationOptions],
  )

  function handlePrefillToggle(enabled: boolean) {
    if (enabled && !optionsReady) return
    setPrefillFromProfile(enabled)
    const next = enabled ? profileMergedDefaults : DEFAULT_FILTERS
    setFilters(next)
    setAppliedFilters(next)
    setPage(1)
  }

  const searchInput = useMemo(
    () => ({
      page,
      limit: SUPERVISEE_SEARCH_PAGE_SIZE,
      keywords: appliedKeyword,
      filters: appliedFilters,
      sortBy,
    }),
    [page, appliedKeyword, appliedFilters, sortBy],
  )

  const { data, isLoading, isError, error, refetch } = useSuperviseeSearch(
    searchInput,
    optionsReady,
  )

  const supervisees = data?.results ?? []
  const total = data?.meta?.totalCount ?? 0

  const errorMessage = isError
    ? parseApiError(error) || 'Something went wrong while loading supervisees.'
    : null

  function handleSearch() {
    setAppliedKeyword(keyword.trim())
    setAppliedFilters(filters)
    setPage(1)
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
    setPrefillFromProfile(false)
    setPage(1)
  }

  function handleClearFilterPanel() {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPrefillFromProfile(false)
    setPage(1)
  }

  return (
    <div className="flex h-[calc(100vh-60px-4rem)] min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-3 pb-6 pt-0">
        <SearchSuperviseeHeader
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={handleSearch}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden py-6 lg:grid lg:min-h-0 lg:grid-cols-[280px_1fr] lg:gap-8 lg:py-8">
        <div className="min-h-0 max-h-[min(42vh,380px)] shrink-0 overflow-y-auto border-b border-border px-3 pb-4 lg:max-h-none lg:border-b-0 lg:pb-0">
          <SearchSuperviseeFilters
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClearFilters={handleClearFilterPanel}
            prefillFromProfile={prefillFromProfile}
            prefillDisabled={!optionsReady}
            onPrefillToggle={handlePrefillToggle}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SearchSuperviseeResults
            supervisees={supervisees}
            total={total}
            page={page}
            pageSize={SUPERVISEE_SEARCH_PAGE_SIZE}
            sortBy={sortBy}
            isLoading={!optionsReady || isLoading}
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
