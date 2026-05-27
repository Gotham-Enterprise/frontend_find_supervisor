'use client'

import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import { cn } from '@/lib/utils'

const superviseeFeeTypeOptions: SelectOption[] = [
  { value: 'per-session', label: 'Per Session' },
  { value: 'monthly', label: 'Monthly' },
]

type SuperviseeStepSupervisionNeedsProps = {
  supervisorTypesData: SupervisorTypeData[]
  supervisorTypesLoading: boolean
  stateOptions: SelectOption[]
  howSoonOptions: SelectOption[]
  availabilityOptions: SelectOption[]
  salaryRangeOptions: SelectOption[]
  statesLoading: boolean
  howSoonLoading: boolean
  availabilityLoading: boolean
  salaryRangesLoading: boolean
  isSubmitting: boolean
}

export function SuperviseeStepSupervisionNeeds({
  supervisorTypesData,
  supervisorTypesLoading,
  stateOptions,
  howSoonOptions,
  availabilityOptions,
  salaryRangeOptions,
  statesLoading,
  howSoonLoading,
  availabilityLoading,
  salaryRangesLoading,
  isSubmitting,
}: SuperviseeStepSupervisionNeedsProps) {
  const { control, clearErrors, setValue } = useFormContext<SuperviseeFormValues>()
  const howSoon = useWatch({ control, name: 'howSoon' })
  const typeOfSupervisor = useWatch({ control, name: 'typeOfSupervisor' })
  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' })
  const isCustomDate = howSoon === 'CUSTOM_DATE'
  const today = new Date().toISOString().split('T')[0]

  // Use names as values so they can be stored directly as strings on SuperviseeProfile
  const supervisorTypeOptions = useMemo<SelectOption[]>(
    () => supervisorTypesData.map((t) => ({ label: t.name, value: t.name })),
    [supervisorTypesData],
  )

  const occupationOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisor) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisor)
    return selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []
  }, [typeOfSupervisor, supervisorTypesData])

  const specialtyOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisor || !supervisorOccupationId) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisor)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [typeOfSupervisor, supervisorOccupationId, supervisorTypesData])

  return (
    <FormSection title="Supervision Needs">
      {/* ── Type of Supervision Needed ── */}
      <FormSelectField
        control={control}
        name="typeOfSupervisor"
        label="Type of Supervision Needed"
        rules={superviseeFieldRules('typeOfSupervisor')}
        options={supervisorTypeOptions}
        placeholder={supervisorTypesLoading ? 'Loading…' : 'Select type of supervision'}
        loading={supervisorTypesLoading}
        isSubmitting={isSubmitting}
        required
        onValueChange={() => {
          setValue('supervisorOccupationId', '')
          setValue('supervisorSpecialtyId', '')
          clearErrors(['supervisorOccupationId', 'supervisorSpecialtyId'])
        }}
      />

      {/* ── Occupation (filtered by supervisor type) ── */}
      <FormSelectField
        control={control}
        name="supervisorOccupationId"
        label="Occupation"
        rules={superviseeFieldRules('supervisorOccupationId')}
        options={occupationOptions}
        placeholder={
          !typeOfSupervisor
            ? 'Select a type of supervision first'
            : occupationOptions.length === 0
              ? 'No occupations available'
              : 'Select occupation'
        }
        loading={supervisorTypesLoading}
        isSubmitting={isSubmitting || !typeOfSupervisor}
        selectKey={typeOfSupervisor}
        required
        onValueChange={() => {
          setValue('supervisorSpecialtyId', '')
          clearErrors('supervisorSpecialtyId')
        }}
      />

      {/* ── Specialty (filtered by occupation) ── */}
      <FormSelectField
        control={control}
        name="supervisorSpecialtyId"
        label="Specialty"
        options={specialtyOptions}
        placeholder={
          !supervisorOccupationId
            ? 'Select an occupation first'
            : specialtyOptions.length === 0
              ? 'No specialties available'
              : 'Select specialty'
        }
        loading={supervisorTypesLoading}
        isSubmitting={isSubmitting || !supervisorOccupationId}
        selectKey={`${typeOfSupervisor}-${supervisorOccupationId}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <FormField
          control={control}
          name="preferredFormat"
          rules={superviseeFieldRules('preferredFormat')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Preferred Format <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FormatSelector
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v)
                    field.onBlur()
                    clearErrors(field.name)
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="stateOfLicensure"
          rules={superviseeFieldRules('stateOfLicensure')}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                State(s) of Licensure <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={stateOptions}
                  value={field.value ?? []}
                  onChange={(v) => {
                    field.onChange(v)
                    clearErrors(field.name)
                  }}
                  placeholder="Add a state (e.g. CA)"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="stateTheyAreLookingIn"
          rules={superviseeFieldRules('stateTheyAreLookingIn')}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                State(s) You Are Looking In <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={stateOptions}
                  value={field.value ?? []}
                  onChange={(v) => {
                    field.onChange(v)
                    clearErrors(field.name)
                  }}
                  placeholder={statesLoading ? 'Loading…' : 'Add a state (e.g. CA)'}
                  disabled={isSubmitting || statesLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <FormSelectField
            control={control}
            name="howSoon"
            label="How Soon Do You Need Supervision?"
            rules={superviseeFieldRules('howSoon')}
            options={howSoonOptions}
            placeholder="Select timeframe"
            loading={howSoonLoading}
            isSubmitting={isSubmitting}
            required
          />
        </div>

        {isCustomDate && (
          <FormField
            control={control}
            name="howSoonDate"
            rules={{ required: 'Please select a date' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Select a date <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      min={today}
                      disabled={isSubmitting}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        clearErrors('howSoonDate')
                      }}
                      className={cn(
                        'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        '[color-scheme:light]',
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormSelectField
          control={control}
          name="availability"
          label="Availability"
          rules={superviseeFieldRules('availability')}
          options={availabilityOptions}
          placeholder="Select availability"
          loading={availabilityLoading}
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="feeType"
          label="Fee Type"
          rules={superviseeFieldRules('feeType')}
          options={superviseeFeeTypeOptions}
          placeholder="Select fee type"
          isSubmitting={isSubmitting}
          required
        />
        <FormSelectField
          control={control}
          name="budgetRange"
          label="Budget Range"
          rules={superviseeFieldRules('budgetRange')}
          options={salaryRangeOptions}
          placeholder="Select budget"
          loading={salaryRangesLoading}
          isSubmitting={isSubmitting}
          required
        />
      </div>
    </FormSection>
  )
}
