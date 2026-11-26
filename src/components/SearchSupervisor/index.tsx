'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { SupervisorSearchMode } from '@/lib/api/supervisor-search'
import { useStateNameOptions, useSuperviseeProfile, useSupervisorSearch } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  getEligiblePreceptorOccupations,
  MEDICAL_DIRECTOR_TYPE_NAME,
  PRECEPTOR_TYPE_NAME,
} from '@/lib/utils/supervisee-eligibility'

import { DEFAULT_FILTERS, resolveFormatGuideTarget, SUPERVISOR_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import { buildSearchUrlParams, parseSearchUrlState } from './searchUrlState'
import type { SortOption, SupervisorSearchFilters, SupervisorSearchResult } from './types'

// The format guide carries every state's rules (~250 KB); load it only once a
// supervisee applies a State License filter and the card actually renders.
const SupervisionFormatGuide = dynamic(() =>
  import('@/components/SupervisionFormatGuide').then((m) => m.SupervisionFormatGuide),
)

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
  /** 'medical-directors' / 'preceptors' render the dedicated Medical Director / Preceptor searches. */
  mode?: SupervisorSearchMode
}

const PAGE_CONFIG: Record<
  SupervisorSearchMode,
  {
    path: '/find-supervisors' | '/find-medical-directors' | '/find-preceptors'
    subtitle?: string
    noun: { singular: string; plural: string; title: string }
  }
> = {
  supervisors: {
    path: '/find-supervisors',
    noun: { singular: 'supervisor', plural: 'supervisors', title: 'Supervisors' },
  },
  'medical-directors': {
    path: '/find-medical-directors',
    subtitle: 'Browse verified medical directors for your practice.',
    noun: { singular: 'medical director', plural: 'medical directors', title: 'Medical Directors' },
  },
  preceptors: {
    path: '/find-preceptors',
    subtitle: 'Browse verified preceptors who can host your clinical rotation.',
    noun: { singular: 'preceptor', plural: 'preceptors', title: 'Preceptors' },
  },
}

export function SearchSupervisorPage({ mode = 'supervisors' }: SearchSupervisorPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Captured once on mount — the URL is the source of truth when returning from a
  // supervisor profile ("Back to Find Supervisors") or opening a shared link.
  // Without URL state, the page deliberately starts with NO filters applied:
  // results are still scoped server-side to the supervisee's stored needs, and
  // any narrowing beyond that is the user's own choice.
  const [initialUrlState] = useState(() => parseSearchUrlState(searchParams))

  const [keyword, setKeyword] = useState(initialUrlState.keyword)
  const [appliedKeyword, setAppliedKeyword] = useState(initialUrlState.keyword)
  const [filters, setFilters] = useState<SupervisorSearchFilters>(initialUrlState.filters)
  const [appliedFilters, setAppliedFilters] = useState<SupervisorSearchFilters>(
    initialUrlState.filters,
  )
  const [sortBy, setSortBy] = useState<SortOption>(initialUrlState.sortBy)
  const [page, setPage] = useState(initialUrlState.page)

  const { data: superviseeProfile, isFetched: superviseeProfileFetched } = useSuperviseeProfile()

  // Cross-redirects between the find pages based on the supervisee's stored
  // needs: the Medical Director page is only for supervisees who need one, the
  // Preceptor page only for students (preceptees), and an MD-only or
  // preceptee profile has nothing to see on the supervisor page.
  useEffect(() => {
    if (!superviseeProfileFetched) return
    const needs = (superviseeProfile?.typeOfSupervisorNeeded ?? []).map((need) => need.trim())
    const hasMdNeed = needs.includes(MEDICAL_DIRECTOR_TYPE_NAME)
    const hasPreceptorNeed = needs.includes(PRECEPTOR_TYPE_NAME)
    const hasNonMdNeed = needs.some(
      (need) => need && need !== MEDICAL_DIRECTOR_TYPE_NAME && need !== PRECEPTOR_TYPE_NAME,
    )
    if (mode === 'preceptors' && !hasPreceptorNeed) {
      router.replace(hasMdNeed && !hasNonMdNeed ? '/find-medical-directors' : '/find-supervisors')
    } else if (mode === 'medical-directors' && !hasMdNeed) {
      router.replace(hasPreceptorNeed ? '/find-preceptors' : '/find-supervisors')
    } else if (mode === 'supervisors' && !hasNonMdNeed && (hasMdNeed || hasPreceptorNeed)) {
      router.replace(hasPreceptorNeed ? '/find-preceptors' : '/find-medical-directors')
    }
  }, [mode, superviseeProfileFetched, superviseeProfile, router])

  // Preceptees only see preceptor disciplines their program may rotate with
  // (the backend scopes results the same way).
  const allowedPreceptorOccupations = useMemo(() => {
    if (mode !== 'preceptors') return undefined
    const occupationName =
      superviseeProfile?.occupation?.name ?? superviseeProfile?.user.occupation?.name
    const allowed = getEligiblePreceptorOccupations(occupationName ?? '')
    return allowed.length > 0 ? allowed : undefined
  }, [mode, superviseeProfile])

  const pageConfig = PAGE_CONFIG[mode]

  // Mirror the applied search state into the URL (replace, not push — filter tweaks
  // shouldn't grow browser history) so it survives navigating away and back.
  useEffect(() => {
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
  }, [appliedKeyword, appliedFilters, sortBy, page, pathname, router])

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

  const { data, isLoading, isError, error, refetch } = useSupervisorSearch(searchInput)

  const supervisors = useMemo(() => {
    const raw = data?.results ?? []
    return sortSupervisorsLocal(raw, sortBy)
  }, [data?.results, sortBy])

  const total = data?.meta?.totalCount ?? 0

  const { data: stateNameOptions = [] } = useStateNameOptions()
  // Format rules cover supervision and NP/PA collaboration, not Medical Directors.
  const guideTarget =
    mode === 'supervisors'
      ? resolveFormatGuideTarget(superviseeProfile, appliedFilters.stateLicenses)
      : null
  const guideStates = (guideTarget?.states ?? []).map((code) => ({
    code,
    name: stateNameOptions.find((o) => o.value === code)?.label ?? code,
  }))

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
          subtitle={pageConfig.subtitle}
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
            supervisionNeeds={superviseeProfile?.typeOfSupervisorNeeded}
            allowedOccupations={allowedPreceptorOccupations}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {guideTarget && (
            <div className="mb-4 shrink-0">
              <SupervisionFormatGuide
                states={guideStates}
                professions={guideTarget.profession ? [guideTarget.profession] : undefined}
              />
            </div>
          )}
          <SearchSupervisorResults
            supervisors={supervisors}
            total={total}
            page={page}
            pageSize={SUPERVISOR_SEARCH_PAGE_SIZE}
            sortBy={sortBy}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onRetry={() => void refetch()}
            onPageChange={setPage}
            onSortChange={(next) => {
              setSortBy(next)
              setPage(1)
            }}
            onClearFilters={handleResetSearch}
            profileBasePath={pageConfig.path}
            noun={pageConfig.noun}
          />
        </div>
      </div>
    </div>
  )
}
