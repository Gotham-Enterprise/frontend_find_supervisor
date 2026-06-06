'use client'

import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { useOccupationOptions, useStatesOptions } from '@/lib/hooks'
import { useMergedSpecialtyOptions } from '@/lib/hooks/useMergedSpecialtyOptions'

import { ActiveFilterChips } from '../SearchSupervisor/ActiveFilterChips'
import { getActiveChips, hasActiveFilters, removeChip } from './helpers'
import type { SuperviseeSearchFilters } from './types'

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

interface SearchSuperviseeFiltersProps {
  filters: SuperviseeSearchFilters
  onChange: (filters: SuperviseeSearchFilters) => void
  onApply: () => void
  onClearFilters: () => void
  prefillFromProfile: boolean
  prefillDisabled?: boolean
  onPrefillToggle: (enabled: boolean) => void
}

export function SearchSuperviseeFilters({
  filters,
  onChange,
  onApply,
  onClearFilters,
  prefillFromProfile,
  prefillDisabled = false,
  onPrefillToggle,
}: SearchSuperviseeFiltersProps) {
  const { data: stateOptions = [], isLoading: statesLoading } = useStatesOptions()
  const { data: occupationOptions = [], isLoading: occupationsLoading } = useOccupationOptions()

  const occupationNameOptions = useMemo(
    () => occupationOptions.map((o) => ({ label: o.label, value: o.label })),
    [occupationOptions],
  )

  const selectedOccupationIds = useMemo(() => {
    return filters.occupations
      .map((name) => occupationOptions.find((o) => o.label === name)?.value)
      .filter((id): id is string => Boolean(id))
  }, [filters.occupations, occupationOptions])

  const { options: specialtyOptionsRaw, isLoading: specialtiesLoading } =
    useMergedSpecialtyOptions(selectedOccupationIds)

  const specialtyNameOptions = useMemo(
    () => specialtyOptionsRaw.map((o) => ({ label: o.label, value: o.label })),
    [specialtyOptionsRaw],
  )

  function handleOccupationsChange(nextOccupations: string[]) {
    const validSpecialties = filters.specialties.filter((s) =>
      specialtyNameOptions.some((o) => o.value === s),
    )
    onChange({
      ...filters,
      occupations: nextOccupations,
      specialties: nextOccupations.length === 0 ? [] : validSpecialties,
    })
  }

  const chips = getActiveChips(filters, stateOptions, occupationNameOptions, specialtyNameOptions)

  return (
    <div className="flex flex-col gap-5 px-0 lg:px-1">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Match my profile</p>
          <p className="text-xs text-muted-foreground">Use your licensure and credentials</p>
        </div>
        <Switch
          checked={prefillFromProfile}
          disabled={prefillDisabled}
          onCheckedChange={onPrefillToggle}
          aria-label="Pre-fill filters from my profile"
        />
      </div>

      {chips.length > 0 && (
        <ActiveFilterChips chips={chips} onRemove={(key) => onChange(removeChip(filters, key))} />
      )}

      <div>
        <FilterLabel>State (looking for supervision in)</FilterLabel>
        <TagInput
          options={stateOptions}
          value={filters.states}
          onChange={(next) => onChange({ ...filters, states: next })}
          placeholder={statesLoading ? 'Loading…' : 'Select states'}
          disabled={statesLoading}
        />
      </div>

      <div>
        <FilterLabel>Occupation</FilterLabel>
        <TagInput
          options={occupationNameOptions}
          value={filters.occupations}
          onChange={handleOccupationsChange}
          placeholder={occupationsLoading ? 'Loading…' : 'Select occupation'}
          disabled={occupationsLoading}
        />
      </div>

      <div>
        <FilterLabel>Specialty</FilterLabel>
        <TagInput
          options={specialtyNameOptions}
          value={filters.specialties}
          onChange={(next) => onChange({ ...filters, specialties: next })}
          placeholder={
            filters.occupations.length === 0
              ? 'Select occupation first'
              : specialtiesLoading
                ? 'Loading…'
                : 'Select specialty'
          }
          disabled={filters.occupations.length === 0 || specialtiesLoading}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <Button type="button" onClick={onApply} className="w-full">
          Apply filters
        </Button>
        {hasActiveFilters(filters) && (
          <Button type="button" variant="outline" onClick={onClearFilters} className="w-full">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
