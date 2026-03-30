'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import {
  useAvailabilityOptions,
  useLicenseTypeOptions,
  useMergedSpecialtyOptions,
  useMultiStateCityOptions,
  useOccupations,
  useStatesOptions,
  useSupervisorFormOptions,
} from '@/lib/hooks'

import { ActiveFilterChips } from './ActiveFilterChips'
import type { ChipOptions } from './helpers'
import {
  getActiveChips,
  hasActiveFilters,
  RADIUS_MAX,
  RADIUS_MIN,
  RADIUS_STEP,
  removeChip,
  SUPERVISION_FORMAT_TAG_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
} from './helpers'
import type { SupervisorSearchFilters } from './types'

interface SearchSupervisorFiltersProps {
  filters: SupervisorSearchFilters
  onChange: (filters: SupervisorSearchFilters) => void
  onApply: () => void
  /** Clears draft + applied filter state (does not clear header keyword). */
  onClearFilters: () => void
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

function FilterError({ message }: { message: string }) {
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export function SearchSupervisorFilters({
  filters,
  onChange,
  onApply,
  onClearFilters,
}: SearchSupervisorFiltersProps) {
  const {
    patientPopulations: {
      data: patientPopulationOptions = [],
      isLoading: populationsLoading,
      isError: populationsError,
    },
  } = useSupervisorFormOptions()

  const { data: occupationsRes, isLoading: occupationsLoading } = useOccupations({ limit: 0 })
  const occupationOptions = useMemo(
    () => occupationsRes?.data?.map((o) => ({ label: o.name, value: String(o.id) })) ?? [],
    [occupationsRes?.data],
  )

  const { options: mergedSpecialtyOptions, isLoading: specialtiesLoading } =
    useMergedSpecialtyOptions(filters.occupationIds)

  const filtersRef = useRef(filters)
  useLayoutEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const mergedSpecialtyKey = mergedSpecialtyOptions
    .map((o) => o.value)
    .sort()
    .join(',')

  const occupationIdsKey = filters.occupationIds.join(',')
  const specialtyIdsKey = filters.specialtyIds.join(',')

  useEffect(() => {
    const f = filtersRef.current
    if (f.occupationIds.length === 0) {
      if (f.specialtyIds.length > 0) {
        onChange({ ...f, specialtyIds: [] })
      }
      return
    }
    const valid = new Set(mergedSpecialtyOptions.map((o) => o.value))
    const next = f.specialtyIds.filter((id) => valid.has(id))
    if (JSON.stringify(next) === JSON.stringify(f.specialtyIds)) return
    onChange({ ...f, specialtyIds: next })
  }, [occupationIdsKey, specialtyIdsKey, mergedSpecialtyKey, mergedSpecialtyOptions, onChange])

  const { data: licenseTypeOptions = [], isLoading: licenseTypesLoading } = useLicenseTypeOptions()
  const { data: availabilityOptions = [], isLoading: availabilityLoading } =
    useAvailabilityOptions()

  const {
    data: stateOptions = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useStatesOptions()

  const {
    data: cityOptions,
    isLoading: citiesLoading,
    isError: citiesError,
  } = useMultiStateCityOptions(filters.states)

  const hasStates = filters.states.length > 0

  const chipOptions: ChipOptions = {
    occupationOptions,
    specialtyOptions: mergedSpecialtyOptions,
    licenseTypeOptions,
    availabilityOptions,
  }
  const chips = getActiveChips(filters, chipOptions)
  const anyActive = hasActiveFilters(filters)

  function set<K extends keyof SupervisorSearchFilters>(key: K, value: SupervisorSearchFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function handleStatesChange(newStates: string[]) {
    onChange({ ...filters, states: newStates, cities: [] })
  }

  function getCityPlaceholder(): string {
    if (!hasStates) return 'Select a state first…'
    if (citiesLoading) return 'Loading cities…'
    if (citiesError) return 'Unable to load cities'
    return 'Select cities…'
  }

  function getStatePlaceholder(loading: boolean, error: boolean): string {
    if (loading) return 'Loading states…'
    if (error) return 'Unable to load states'
    return 'Select states…'
  }

  return (
    <aside className="w-full space-y-5 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {anyActive && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-primary hover:underline focus:outline-none"
          >
            Clear all
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <ActiveFilterChips chips={chips} onRemove={(key) => onChange(removeChip(filters, key))} />
      )}

      <div>
        <FilterLabel>Occupation</FilterLabel>
        <TagInput
          options={occupationOptions}
          value={filters.occupationIds}
          onChange={(v) =>
            onChange({
              ...filters,
              occupationIds: v,
              specialtyIds: v.length === 0 ? [] : filters.specialtyIds,
            })
          }
          placeholder={occupationsLoading ? 'Loading…' : 'Select occupations…'}
          disabled={occupationsLoading}
        />
      </div>

      <div>
        <FilterLabel>Specialty</FilterLabel>
        <TagInput
          options={mergedSpecialtyOptions}
          value={filters.specialtyIds}
          onChange={(v) => set('specialtyIds', v)}
          placeholder={
            filters.occupationIds.length === 0
              ? 'Select occupation first'
              : specialtiesLoading
                ? 'Loading…'
                : 'Select specialties…'
          }
          disabled={filters.occupationIds.length === 0 || specialtiesLoading}
        />
      </div>

      <div>
        <FilterLabel>License type</FilterLabel>
        <TagInput
          options={licenseTypeOptions}
          value={filters.licenseTypes}
          onChange={(v) => set('licenseTypes', v)}
          placeholder={licenseTypesLoading ? 'Loading…' : 'Select license types…'}
          disabled={licenseTypesLoading}
        />
      </div>

      <div>
        <FilterLabel>State License</FilterLabel>
        <TagInput
          options={stateOptions}
          value={filters.stateLicenses}
          onChange={(v) => set('stateLicenses', v)}
          placeholder={getStatePlaceholder(statesLoading, statesError)}
          disabled={statesLoading || statesError}
        />
        {statesError && <FilterError message="Unable to load states right now." />}
      </div>

      <div>
        <FilterLabel>State</FilterLabel>
        <TagInput
          options={stateOptions}
          value={filters.states}
          onChange={handleStatesChange}
          placeholder={getStatePlaceholder(statesLoading, statesError)}
          disabled={statesLoading || statesError}
        />
        {statesError && <FilterError message="Unable to load states right now." />}
      </div>

      <div>
        <FilterLabel>City</FilterLabel>
        <TagInput
          options={cityOptions}
          value={filters.cities}
          onChange={(v) => set('cities', v)}
          placeholder={getCityPlaceholder()}
          disabled={!hasStates || citiesLoading || citiesError}
        />
        {hasStates && citiesError && (
          <FilterError message="Unable to load cities for the selected state." />
        )}
      </div>

      <div>
        <FilterLabel>Radius</FilterLabel>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Within {filters.radiusMiles} miles</span>
          </div>
          <Slider
            value={filters.radiusMiles}
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            step={RADIUS_STEP}
            onChange={(v) => set('radiusMiles', v)}
            aria-label="Search radius in miles"
          />
        </div>
      </div>

      <div>
        <FilterLabel>Format</FilterLabel>
        <TagInput
          options={SUPERVISION_FORMAT_TAG_OPTIONS}
          value={filters.supervisionFormats}
          onChange={(v) => set('supervisionFormats', v)}
          placeholder="Select formats…"
        />
      </div>

      <div>
        <FilterLabel>Years of Experience</FilterLabel>
        <TagInput
          options={YEARS_OF_EXPERIENCE_OPTIONS}
          value={filters.yearsExperience}
          onChange={(v) => set('yearsExperience', v)}
          placeholder="Select experience ranges…"
        />
      </div>

      <div>
        <FilterLabel>Patient Population</FilterLabel>
        {populationsLoading ? (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 w-16 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : populationsError ? (
          <FilterError message="Unable to load population options." />
        ) : (
          <TagInput
            options={patientPopulationOptions}
            value={filters.patientPopulation}
            onChange={(v) => set('patientPopulation', v)}
            placeholder="Select populations…"
          />
        )}
      </div>

      <div>
        <FilterLabel>Availability</FilterLabel>
        <TagInput
          options={availabilityOptions}
          value={filters.availability}
          onChange={(v) => set('availability', v)}
          placeholder={availabilityLoading ? 'Loading…' : 'Select availability…'}
          disabled={availabilityLoading}
        />
        <label className="mt-3 flex cursor-pointer items-center gap-2.5">
          <Switch
            checked={filters.acceptingOnly}
            onCheckedChange={(checked) => set('acceptingOnly', checked)}
          />
          <span className="text-sm text-foreground">Accepting supervisees only</span>
        </label>
      </div>

      <Button type="button" className="w-full" onClick={onApply}>
        Apply Filters
      </Button>
    </aside>
  )
}
