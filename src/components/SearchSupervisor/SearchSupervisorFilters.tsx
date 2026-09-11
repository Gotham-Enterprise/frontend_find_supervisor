'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption } from '@/lib/api/options'
import type { SupervisorSearchMode } from '@/lib/api/supervisor-search'
import {
  useAvailabilityOptions,
  useCitiesOptions,
  useStatesOptions,
  useSupervisorFormOptions,
  useSupervisorTypesData,
} from '@/lib/hooks'
import { isMedicalDirectorType } from '@/lib/utils/supervisee-eligibility'

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

/** `SelectItem` cannot use `value=""`; this value means no location filter. */
const LOCATION_FILTER_NONE = '__none__'

interface SearchSupervisorFiltersProps {
  filters: SupervisorSearchFilters
  onChange: (filters: SupervisorSearchFilters) => void
  onApply: () => void
  /** Clears draft + applied filter state (does not clear header keyword). */
  onClearFilters: () => void
  /** 'medical-directors' hides the irrelevant sections (occupation, license type, patient population). */
  mode?: SupervisorSearchMode
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
  mode = 'supervisors',
}: SearchSupervisorFiltersProps) {
  const isMedicalDirectors = mode === 'medical-directors'
  const {
    patientPopulations: {
      data: patientPopulationOptions = [],
      isLoading: populationsLoading,
      isError: populationsError,
    },
  } = useSupervisorFormOptions()

  // Hierarchy data from /api/supervision/supervisor-type
  const { data: supervisorTypesData = [], isLoading: hierarchyLoading } = useSupervisorTypesData()

  // Occupation options — union of occupations across all supervisor types.
  // (There is no supervisor-type filter: the backend already scopes results
  // to the supervisee's stored supervision needs.)
  const occupationOptions = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>()
    const opts: SelectOption[] = []
    for (const t of supervisorTypesData) {
      for (const o of t.occupations) {
        if (!seen.has(o.name)) {
          seen.add(o.name)
          opts.push({ label: o.name, value: o.name })
        }
      }
    }
    return opts
  }, [supervisorTypesData])

  // Specialty options — union of specialties across selected occupations. On
  // the Medical Director page there is no occupation filter, so the physician
  // specialties list directly from the Medical Director type.
  const specialtyOptions = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>()
    const opts: SelectOption[] = []
    if (isMedicalDirectors) {
      const mdType = supervisorTypesData.find((t) => isMedicalDirectorType(t))
      for (const o of mdType?.occupations ?? []) {
        for (const s of o.specialties) {
          if (!seen.has(s.name)) {
            seen.add(s.name)
            opts.push({ label: s.name, value: s.name })
          }
        }
      }
      return opts
    }
    if (filters.supervisorOccupations.length === 0) return []
    for (const t of supervisorTypesData) {
      for (const o of t.occupations) {
        if (filters.supervisorOccupations.includes(o.name)) {
          for (const s of o.specialties) {
            if (!seen.has(s.name)) {
              seen.add(s.name)
              opts.push({ label: s.name, value: s.name })
            }
          }
        }
      }
    }
    return opts
  }, [isMedicalDirectors, filters.supervisorOccupations, supervisorTypesData])

  // License Type options — union of license types across selected occupations
  // (if no occupation selected, show all unique license types)
  const licenseTypeOptions = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>()
    const opts: SelectOption[] = []
    for (const t of supervisorTypesData) {
      for (const o of t.occupations) {
        const isRelevant =
          filters.supervisorOccupations.length === 0 ||
          filters.supervisorOccupations.includes(o.name)
        if (isRelevant) {
          for (const l of o.licenseTypes) {
            if (!seen.has(l.name)) {
              seen.add(l.name)
              opts.push({ label: l.name, value: l.name })
            }
          }
          for (const d of o.degreeTypes ?? []) {
            if (!seen.has(d.name)) {
              seen.add(d.name)
              opts.push({ label: d.name, value: d.name })
            }
          }
        }
      }
    }
    return opts
  }, [filters.supervisorOccupations, supervisorTypesData])

  const filtersRef = useRef(filters)
  useLayoutEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Prune specialty selections that no longer belong to selected occupations
  const occupationsKey = filters.supervisorOccupations.join(',')
  const specialtiesKey = filters.supervisorSpecialties.join(',')
  const specialtyValuesKey = specialtyOptions
    .map((o) => o.value)
    .sort()
    .join(',')

  useEffect(() => {
    const f = filtersRef.current
    if (isMedicalDirectors) {
      // No occupation cascade here; keep selections while the hierarchy loads.
      if (specialtyOptions.length === 0) return
      const valid = new Set(specialtyOptions.map((o) => o.value))
      const next = f.supervisorSpecialties.filter((v) => valid.has(v))
      if (JSON.stringify(next) === JSON.stringify(f.supervisorSpecialties)) return
      onChange({ ...f, supervisorSpecialties: next })
      return
    }
    if (f.supervisorOccupations.length === 0) {
      if (f.supervisorSpecialties.length > 0) onChange({ ...f, supervisorSpecialties: [] })
      return
    }
    const valid = new Set(specialtyOptions.map((o) => o.value))
    const next = f.supervisorSpecialties.filter((v) => valid.has(v))
    if (JSON.stringify(next) === JSON.stringify(f.supervisorSpecialties)) return
    onChange({ ...f, supervisorSpecialties: next })
  }, [
    isMedicalDirectors,
    occupationsKey,
    specialtiesKey,
    specialtyValuesKey,
    specialtyOptions,
    onChange,
  ])

  const { data: availabilityOptions = [], isLoading: availabilityLoading } =
    useAvailabilityOptions()

  const {
    data: stateOptions = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useStatesOptions()

  const stateForCities = filters.state.trim()
  const {
    data: cityOptions = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = useCitiesOptions(stateForCities)

  const hasSearchState = Boolean(stateForCities)

  const cityOptionsKey = cityOptions.map((o) => o.value).join('|')

  useEffect(() => {
    const f = filtersRef.current
    const city = f.city.trim()
    if (!city || !stateForCities) return
    if (citiesLoading) return
    const valid = new Set(cityOptions.map((o) => o.value))
    if (valid.size > 0 && !valid.has(city)) {
      onChange({ ...f, city: '' })
    }
  }, [stateForCities, cityOptionsKey, citiesLoading, cityOptions, onChange])

  const chipOptions: ChipOptions = {
    licenseTypeOptions,
    availabilityOptions,
  }
  const chips = getActiveChips(filters, chipOptions)
  const anyActive = hasActiveFilters(filters)

  function set<K extends keyof SupervisorSearchFilters>(key: K, value: SupervisorSearchFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function getStatePlaceholder(loading: boolean, error: boolean): string {
    if (loading) return 'Loading states…'
    if (error) return 'Unable to load states'
    return 'Select states…'
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col lg:shrink-0">
      {/* Pinned header — title + Clear all stay visible while the fields scroll */}
      <div className="flex shrink-0 items-center justify-between pb-3">
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

      {/* Scrollable filter fields — scrollbar-visible keeps the scrollbar and its
          track always shown (not the auto-hiding overlay) so the area reads as scrollable */}
      <div className="scrollbar-visible min-h-0 flex-1 space-y-5 overflow-y-auto pb-3 pr-1">
        {chips.length > 0 && (
          <ActiveFilterChips chips={chips} onRemove={(key) => onChange(removeChip(filters, key))} />
        )}

        {/* Occupation/License Type are meaningless for Medical Directors
            (single occupation, degree-typed) — hidden on that page. */}
        {!isMedicalDirectors && (
          <div>
            <FilterLabel>Occupation</FilterLabel>
            <TagInput
              options={occupationOptions}
              value={filters.supervisorOccupations}
              onChange={(v) =>
                onChange({
                  ...filters,
                  supervisorOccupations: v,
                  supervisorSpecialties: v.length === 0 ? [] : filters.supervisorSpecialties,
                })
              }
              placeholder={hierarchyLoading ? 'Loading…' : 'Select occupations…'}
              disabled={hierarchyLoading}
            />
          </div>
        )}

        <div>
          <FilterLabel>Specialty</FilterLabel>
          <TagInput
            options={specialtyOptions}
            value={filters.supervisorSpecialties}
            onChange={(v) => set('supervisorSpecialties', v)}
            placeholder={
              isMedicalDirectors
                ? hierarchyLoading
                  ? 'Loading…'
                  : 'Select specialties…'
                : filters.supervisorOccupations.length === 0
                  ? 'Select occupation first'
                  : 'Select specialties…'
            }
            disabled={
              hierarchyLoading ||
              (!isMedicalDirectors && filters.supervisorOccupations.length === 0)
            }
          />
        </div>

        {!isMedicalDirectors && (
          <div>
            <FilterLabel>License Type</FilterLabel>
            <TagInput
              options={licenseTypeOptions}
              value={filters.licenseTypes}
              onChange={(v) => set('licenseTypes', v)}
              placeholder={hierarchyLoading ? 'Loading…' : 'Select license types…'}
              disabled={hierarchyLoading}
            />
          </div>
        )}

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
          <Select
            value={stateForCities ? filters.state.trim() : LOCATION_FILTER_NONE}
            onValueChange={(v) => {
              const nextState = v === LOCATION_FILTER_NONE ? '' : (v ?? '').trim()
              onChange({ ...filters, state: nextState, city: '' })
            }}
            disabled={statesLoading || statesError}
          >
            <SelectTrigger className="w-full" aria-label="Search by state">
              <SelectValue>
                {stateForCities
                  ? (stateOptions.find((o) => o.value === stateForCities)?.label ?? stateForCities)
                  : 'Any state'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LOCATION_FILTER_NONE}>Any state</SelectItem>
              {stateOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statesError && <FilterError message="Unable to load states right now." />}
        </div>

        <div>
          <FilterLabel>City</FilterLabel>
          <Select
            key={stateForCities || 'no-state'}
            value={filters.city.trim() ? filters.city.trim() : LOCATION_FILTER_NONE}
            onValueChange={(v) => {
              const nextCity = v === LOCATION_FILTER_NONE ? '' : (v ?? '').trim()
              onChange({ ...filters, city: nextCity })
            }}
            disabled={!hasSearchState || citiesLoading || citiesError}
          >
            <SelectTrigger className="w-full" aria-label="Search by city">
              <SelectValue>
                {!hasSearchState
                  ? 'Select a state first…'
                  : citiesLoading
                    ? 'Loading cities…'
                    : citiesError
                      ? 'Unable to load cities'
                      : filters.city.trim()
                        ? (cityOptions.find((o) => o.value === filters.city.trim())?.label ??
                          filters.city.trim())
                        : 'Any city'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LOCATION_FILTER_NONE}>Any city</SelectItem>
              {cityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasSearchState && citiesError && (
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

        {/* Not part of the medical-directorship search. */}
        {!isMedicalDirectors && (
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
        )}

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
      </div>

      {/* Pinned footer — Apply is always reachable without scrolling */}
      <div className="shrink-0 border-t border-border bg-background pt-3">
        <Button type="button" className="w-full" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </aside>
  )
}
