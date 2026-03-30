'use client'

import { useMemo, useState } from 'react'

import { useMergedSpecialtyOptions, useOccupations, useSupervisorSearch } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

import { DEFAULT_FILTERS, SUPERVISOR_SEARCH_PAGE_SIZE } from './helpers'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import type { SortOption, SupervisorSearchFilters, SupervisorSearchResult } from './types'

function sortSupervisorsLocal(
  list: SupervisorSearchResult[],
  sortBy: SortOption,
): SupervisorSearchResult[] {
  const copy = [...list]
  const exp = (s: SupervisorSearchResult) => {
    const n = parseInt(String(s.yearsOfExperience).replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? n : 0
  }
  switch (sortBy) {
    case 'experience_desc':
      return copy.sort((a, b) => exp(b) - exp(a))
    case 'experience_asc':
      return copy.sort((a, b) => exp(a) - exp(b))
    case 'most_reviewed':
    case 'best_match':
    default:
      return copy
  }
}

export function SearchSupervisorPage() {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [filters, setFilters] = useState<SupervisorSearchFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<SupervisorSearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('best_match')
  const [page, setPage] = useState(1)

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
    }),
    [page, appliedKeyword, appliedFilters, occupationNames, specialtyNames],
  )

  const { data, isLoading, isError, error, refetch } = useSupervisorSearch(searchInput)

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
    <div>
      <SearchSupervisorHeader
        keyword={keyword}
        supervisionFormats={filters.supervisionFormats}
        onKeywordChange={setKeyword}
        onSupervisionFormatsChange={(next) => setFilters({ ...filters, supervisionFormats: next })}
        onSearch={handleSearch}
      />

      <div className="border-t border-border bg-background">
        <div className="flex w-full flex-col gap-6 py-8 lg:flex-row lg:gap-8">
          <SearchSupervisorFilters
            filters={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onClearFilters={handleClearFilterPanel}
          />

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
            onSortChange={setSortBy}
            onClearFilters={handleResetSearch}
          />
        </div>
      </div>
    </div>
  )
}
