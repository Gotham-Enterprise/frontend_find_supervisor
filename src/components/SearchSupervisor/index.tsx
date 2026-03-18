'use client'

import { useMemo, useState } from 'react'

import { DEFAULT_FILTERS } from './helpers'
import { MOCK_SUPERVISORS, MOCK_TOTAL, PAGE_SIZE } from './mock-data'
import { SearchSupervisorFilters } from './SearchSupervisorFilters'
import { SearchSupervisorHeader } from './SearchSupervisorHeader'
import { SearchSupervisorResults } from './SearchSupervisorResults'
import type { SortOption, SupervisorSearchFilters } from './types'

export function SearchSupervisorPage() {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [formatQuickFilter, setFormatQuickFilter] = useState('')
  const [filters, setFilters] = useState<SupervisorSearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('best_match')
  const [page, setPage] = useState(1)

  function handleSearch() {
    setAppliedKeyword(keyword)
    setPage(1)
  }

  function handleFormatQuickFilter(value: string) {
    const trimmed = value.trim()
    setFormatQuickFilter(trimmed)
    setFilters((prev) => ({
      ...prev,
      formatVirtual: trimmed === 'VIRTUAL',
      formatInPerson: trimmed === 'IN_PERSON',
      formatHybrid: trimmed === 'HYBRID',
    }))
    setPage(1)
  }

  function handleFiltersChange(next: SupervisorSearchFilters) {
    setFilters(next)
    setPage(1)
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setKeyword('')
    setAppliedKeyword('')
    setFormatQuickFilter('')
    setPage(1)
  }

  // Client-side filtering against mock data — replace with API call when backend is ready
  const filtered = useMemo(() => {
    return MOCK_SUPERVISORS.filter((s) => {
      if (
        appliedKeyword &&
        !s.fullName.toLowerCase().includes(appliedKeyword.toLowerCase()) &&
        !s.licenseType.toLowerCase().includes(appliedKeyword.toLowerCase()) &&
        !s.specialties.some((sp) => sp.toLowerCase().includes(appliedKeyword.toLowerCase()))
      ) {
        return false
      }

      if (
        filters.stateLicenses.length > 0 &&
        !filters.stateLicenses.some((sl) => sl.toUpperCase() === s.licenseState.toUpperCase())
      ) {
        return false
      }

      if (
        filters.states.length > 0 &&
        !filters.states.some((st) => st.toUpperCase() === s.state.toUpperCase())
      ) {
        return false
      }

      if (
        filters.cities.length > 0 &&
        !filters.cities.some((c) => c.toLowerCase() === s.city.toLowerCase())
      ) {
        return false
      }

      if (filters.formatVirtual && !s.formats.includes('VIRTUAL')) return false
      if (filters.formatInPerson && !s.formats.includes('IN_PERSON')) return false
      if (filters.formatHybrid && !s.formats.includes('HYBRID')) return false
      if (filters.acceptingOnly && !s.accepting) return false

      if (
        filters.patientPopulation.length > 0 &&
        !filters.patientPopulation.some((pop) => s.patientPopulation.includes(pop))
      ) {
        return false
      }

      return true
    })
  }, [appliedKeyword, filters])

  const totalCount = filtered.length > 0 ? MOCK_TOTAL : 0
  const paginated = filtered.slice(0, PAGE_SIZE)

  return (
    <div>
      <SearchSupervisorHeader
        keyword={keyword}
        formatQuickFilter={formatQuickFilter}
        onKeywordChange={setKeyword}
        onFormatQuickFilterChange={handleFormatQuickFilter}
        onSearch={handleSearch}
      />

      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
          <SearchSupervisorFilters filters={filters} onChange={handleFiltersChange} />

          <SearchSupervisorResults
            supervisors={paginated}
            total={totalCount}
            page={page}
            sortBy={sortBy}
            isLoading={false}
            onPageChange={setPage}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  )
}
