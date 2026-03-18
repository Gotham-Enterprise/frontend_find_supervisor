'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { useMultiStateCityOptions, useStatesOptions, useSupervisorFormOptions } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import { ActiveFilterChips } from './ActiveFilterChips'
import {
  DEFAULT_FILTERS,
  getActiveChips,
  hasActiveFilters,
  removeChip,
  YEARS_OF_EXPERIENCE_OPTIONS,
} from './helpers'
import type { SupervisorSearchFilters } from './types'

interface SearchSupervisorFiltersProps {
  filters: SupervisorSearchFilters
  onChange: (filters: SupervisorSearchFilters) => void
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

export function SearchSupervisorFilters({ filters, onChange }: SearchSupervisorFiltersProps) {
  // ── Shared signup options (reused from supervisor signup form) ──────────────
  const {
    patientPopulations: {
      data: patientPopulationOptions = [],
      isLoading: populationsLoading,
      isError: populationsError,
    },
  } = useSupervisorFormOptions()

  // ── Location options ────────────────────────────────────────────────────────
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

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const chips = getActiveChips(filters)
  const anyActive = hasActiveFilters(filters)

  function set<K extends keyof SupervisorSearchFilters>(key: K, value: SupervisorSearchFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  /** When states change, clear all selected cities — they may no longer be valid. */
  function handleStatesChange(newStates: string[]) {
    onChange({ ...filters, states: newStates, cities: [] })
  }

  function togglePopulation(value: string) {
    const current = filters.patientPopulation
    const next = current.includes(value) ? current.filter((p) => p !== value) : [...current, value]
    set('patientPopulation', next)
  }

  // ── City TagInput state ──────────────────────────────────────────────────────
  function getCityPlaceholder(): string {
    if (!hasStates) return 'Select a state first…'
    if (citiesLoading) return 'Loading cities…'
    if (citiesError) return 'Unable to load cities'
    return 'Select cities…'
  }

  // ── State TagInput placeholder ───────────────────────────────────────────────
  function getStatePlaceholder(loading: boolean, error: boolean): string {
    if (loading) return 'Loading states…'
    if (error) return 'Unable to load states'
    return 'Select states…'
  }

  return (
    <aside className="w-full space-y-5 lg:w-[188px] lg:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {anyActive && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs font-medium text-primary hover:underline focus:outline-none"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <ActiveFilterChips chips={chips} onRemove={(key) => onChange(removeChip(filters, key))} />
      )}

      {/* State License — multi-select, API-backed */}
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

      {/* State — multi-select, API-backed. Changing clears cities. */}
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

      {/* City — multi-select, requires state(s) selected first */}
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

      {/* Format */}
      <div>
        <FilterLabel>Format</FilterLabel>
        <div className="space-y-2.5">
          {(
            [
              { key: 'formatVirtual', label: 'Virtual' },
              { key: 'formatInPerson', label: 'In-Person' },
              { key: 'formatHybrid', label: 'Hybrid' },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox checked={filters[key]} onCheckedChange={(checked) => set(key, checked)} />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Years of experience */}
      <div>
        <FilterLabel>Years of Experience</FilterLabel>
        <Select
          value={filters.yearsOfExperience}
          onValueChange={(v) => set('yearsOfExperience', v ?? '')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {YEARS_OF_EXPERIENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patient population — API-backed from useSupervisorFormOptions */}
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
          <div className="flex flex-wrap gap-1.5">
            {patientPopulationOptions.map((opt) => {
              const active = filters.patientPopulation.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => togglePopulation(opt.value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <FilterLabel>Availability</FilterLabel>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Switch
            checked={filters.acceptingOnly}
            onCheckedChange={(checked) => set('acceptingOnly', checked)}
          />
          <span className="text-sm text-foreground">Accepting supervisees only</span>
        </label>
      </div>

      <Button className="w-full" onClick={() => onChange({ ...filters })}>
        Apply Filters
      </Button>
    </aside>
  )
}
