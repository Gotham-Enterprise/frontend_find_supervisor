'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import {
  useAvailabilityOptions,
  useStatesOptions,
  useSuperviseeProfile,
  useSupervisorSearch,
  useSupervisorTypesData,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

import { DEFAULT_FILTERS, SUPERVISOR_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import { buildSearchUrlParams, parseSearchUrlState } from './searchUrlState'
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Captured once on mount — the URL is the source of truth when returning from a
  // supervisor profile ("Back to Find Supervisors") or opening a shared link.
  const [initialUrlState] = useState(() => parseSearchUrlState(searchParams))

  const [keyword, setKeyword] = useState(initialUrlState.keyword)
  const [appliedKeyword, setAppliedKeyword] = useState(initialUrlState.keyword)
  const [filters, setFilters] = useState<SupervisorSearchFilters>(initialUrlState.filters)
  const [appliedFilters, setAppliedFilters] = useState<SupervisorSearchFilters>(
    initialUrlState.filters,
  )
  const [sortBy, setSortBy] = useState<SortOption>(initialUrlState.sortBy)
  const [page, setPage] = useState(initialUrlState.page)
  // A URL that already carries search state skips the profile prefill below.
  const [filtersInitialized, setFiltersInitialized] = useState(initialUrlState.hasState)

  const { data: superviseeProfile, isFetched: superviseeProfileFetched } = useSuperviseeProfile()
  const supervisorTypesQuery = useSupervisorTypesData()
  const statesQuery = useStatesOptions()
  const availabilityQuery = useAvailabilityOptions()

  const optionsReady =
    superviseeProfileFetched &&
    supervisorTypesQuery.isFetched &&
    statesQuery.isFetched &&
    availabilityQuery.isFetched

  // Populate the filters from the supervisee's Supervision Needs once everything has
  // loaded, before the first search fires. Applied only once — after that the filters
  // belong to the user (removable via chips / "Clear all"). State is adjusted during
  // render (not in an effect) so the search query never fires with the empty defaults.
  if (optionsReady && !filtersInitialized) {
    const merged = mergeSuperviseeProfileIntoSearchFilters(
      superviseeProfile ?? undefined,
      DEFAULT_FILTERS,
      statesQuery.data ?? [],
      availabilityQuery.data ?? [],
      supervisorTypesQuery.data ?? [],
    )
    setFilters(merged)
    setAppliedFilters(merged)
    setFiltersInitialized(true)
  }

  // Mirror the applied search state into the URL (replace, not push — filter tweaks
  // shouldn't grow browser history) so it survives navigating away and back.
  useEffect(() => {
    if (!filtersInitialized) return
    const qs = buildSearchUrlParams({
      keyword: appliedKeyword,
      filters: appliedFilters,
      sortBy,
      page,
    }).toString()
    const target = qs ? `${pathname}?${qs}` : pathname
    if (window.location.pathname + window.location.search !== target) {
      router.replace(target, { scroll: false })
    }
  }, [filtersInitialized, appliedKeyword, appliedFilters, sortBy, page, pathname, router])

  const searchInput = useMemo(
    () => ({
      page,
      limit: SUPERVISOR_SEARCH_PAGE_SIZE,
      keywords: appliedKeyword,
      filters: appliedFilters,
      sortBy,
    }),
    [page, appliedKeyword, appliedFilters, sortBy],
  )

  const { data, isLoading, isError, error, refetch } = useSupervisorSearch(
    searchInput,
    filtersInitialized,
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
    <div className="flex h-[calc(100vh-60px-3rem)] min-h-0 flex-col overflow-hidden">
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
        {/* The filter panel scrolls internally (pinned header/footer), not here */}
        <div className="flex min-h-0 max-h-[min(42vh,380px)] shrink-0 flex-col overflow-hidden border-b border-border px-3 pb-4 lg:max-h-none lg:border-b-0 lg:pb-0">
          <SearchSupervisorFilters
            filters={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onClearFilters={handleClearFilterPanel}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SearchSupervisorResults
            supervisors={supervisors}
            total={total}
            page={page}
            pageSize={SUPERVISOR_SEARCH_PAGE_SIZE}
            sortBy={sortBy}
            isLoading={!filtersInitialized || isLoading}
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
