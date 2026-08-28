'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { SupervisorSearchMode } from '@/lib/api/supervisor-search'
import {
  useAvailabilityOptions,
  useStatesOptions,
  useSuperviseeProfile,
  useSupervisorSearch,
  useSupervisorTypesData,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

import { DEFAULT_FILTERS, SUPERVISOR_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import { buildSearchUrlParams, parseSearchUrlState } from './searchUrlState'
import { SeededFiltersNotice } from './SeededFiltersNotice'
import {
  hasSeededFilterValues,
  mergeSuperviseeProfileIntoSearchFilters,
} from './superviseeSearchDefaults'
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

interface SearchSupervisorPageProps {
  /** 'medical-directors' renders the dedicated Medical Director search. */
  mode?: SupervisorSearchMode
}

export function SearchSupervisorPage({ mode = 'supervisors' }: SearchSupervisorPageProps) {
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

  // Zero-result auto-relax for the profile-seeded first search: `seededFilters`
  // keeps the prefill snapshot for "Reapply my preferences", `awaitingSeededResult`
  // arms the relax for that first untouched search only.
  const [seededFilters, setSeededFilters] = useState<SupervisorSearchFilters | null>(null)
  const [awaitingSeededResult, setAwaitingSeededResult] = useState(false)
  const [relaxNoticeVisible, setRelaxNoticeVisible] = useState(false)

  const { data: superviseeProfile, isFetched: superviseeProfileFetched } = useSuperviseeProfile()
  const supervisorTypesQuery = useSupervisorTypesData()
  const statesQuery = useStatesOptions()
  const availabilityQuery = useAvailabilityOptions()

  // Cross-redirects between the two find pages based on the supervisee's
  // stored needs: the Medical Director page is only for supervisees who need
  // one, and an MD-only supervisee has nothing to see on the supervisor page.
  useEffect(() => {
    if (!superviseeProfileFetched) return
    const needs = (superviseeProfile?.typeOfSupervisorNeeded ?? []).map((need) => need.trim())
    const hasMdNeed = needs.includes(MEDICAL_DIRECTOR_TYPE_NAME)
    const hasNonMdNeed = needs.some((need) => need && need !== MEDICAL_DIRECTOR_TYPE_NAME)
    if (mode === 'medical-directors' && !hasMdNeed) {
      router.replace('/find-supervisors')
    } else if (mode === 'supervisors' && hasMdNeed && !hasNonMdNeed) {
      router.replace('/find-medical-directors')
    }
  }, [mode, superviseeProfileFetched, superviseeProfile, router])

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
    // The MD page hides occupation/license-type/patient-population filters, so
    // profile-prefilled values for them must not be silently applied either.
    const scoped =
      mode === 'medical-directors'
        ? { ...merged, supervisorOccupations: [], licenseTypes: [], patientPopulation: [] }
        : merged
    setFilters(scoped)
    setAppliedFilters(scoped)
    if (hasSeededFilterValues(scoped)) {
      setSeededFilters(scoped)
      setAwaitingSeededResult(true)
    }
    setFiltersInitialized(true)
  }

  // Mirror the applied search state into the URL (replace, not push — filter tweaks
  // shouldn't grow browser history) so it survives navigating away and back.
  // Held off while the seeded first search is settling: router.replace commits
  // async, so writing the seeded params here could land AFTER the zero-result
  // relax below resets them — leaving a stale seeded URL nothing cleans up.
  useEffect(() => {
    if (!filtersInitialized || awaitingSeededResult) return
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
  }, [
    filtersInitialized,
    awaitingSeededResult,
    appliedKeyword,
    appliedFilters,
    sortBy,
    page,
    pathname,
    router,
  ])

  const searchInput = useMemo(
    () => ({
      page,
      limit: SUPERVISOR_SEARCH_PAGE_SIZE,
      keywords: appliedKeyword,
      filters: appliedFilters,
      sortBy,
      searchMode: mode,
    }),
    [page, appliedKeyword, appliedFilters, sortBy, mode],
  )

  const { data, isLoading, isError, error, refetch } = useSupervisorSearch(
    searchInput,
    filtersInitialized,
  )

  // If the auto-seeded first search comes back empty, clear the seeded filters and
  // rerun so the user never lands on an empty page they didn't cause. Any user
  // interaction before the result settles disarms this instead. Like the prefill
  // above, state is adjusted during render (not in an effect) so the relaxed
  // search fires before the empty result ever paints.
  if (awaitingSeededResult && !isLoading && (data || isError)) {
    setAwaitingSeededResult(false)
    if (!isError && (data?.meta?.totalCount ?? 0) === 0) {
      setFilters(DEFAULT_FILTERS)
      setAppliedFilters(DEFAULT_FILTERS)
      setPage(1)
      setRelaxNoticeVisible(true)
    }
  }

  const supervisors = useMemo(() => {
    const raw = data?.results ?? []
    return sortSupervisorsLocal(raw, sortBy)
  }, [data?.results, sortBy])

  const total = data?.meta?.totalCount ?? 0

  const errorMessage = isError
    ? parseApiError(error) || 'Something went wrong while loading supervisors.'
    : null

  // Once the user drives the search themselves, the seeded first search no longer
  // owns the results — stop any pending auto-relax and drop its notice.
  function disarmSeededRelax() {
    setAwaitingSeededResult(false)
    setRelaxNoticeVisible(false)
  }

  function handleSearch() {
    disarmSeededRelax()
    setAppliedKeyword(keyword.trim())
    setAppliedFilters(filters)
    setPage(1)
  }

  function handleFiltersChange(next: SupervisorSearchFilters) {
    setFilters(next)
  }

  function handleApplyFilters() {
    disarmSeededRelax()
    setAppliedFilters(filters)
    setPage(1)
  }

  function handleResetSearch() {
    disarmSeededRelax()
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setKeyword('')
    setAppliedKeyword('')
    setPage(1)
  }

  function handleClearFilterPanel() {
    disarmSeededRelax()
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function handleReapplySeededFilters() {
    if (!seededFilters) return
    setFilters(seededFilters)
    setAppliedFilters(seededFilters)
    setPage(1)
    setRelaxNoticeVisible(false)
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
          subtitle={
            mode === 'medical-directors'
              ? 'Browse verified medical directors for your practice.'
              : undefined
          }
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
            mode={mode}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {relaxNoticeVisible && (
            <SeededFiltersNotice
              mode={mode}
              onReapply={handleReapplySeededFilters}
              onDismiss={() => setRelaxNoticeVisible(false)}
            />
          )}
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
            profileBasePath={
              mode === 'medical-directors' ? '/find-medical-directors' : '/find-supervisors'
            }
          />
        </div>
      </div>
    </div>
  )
}
