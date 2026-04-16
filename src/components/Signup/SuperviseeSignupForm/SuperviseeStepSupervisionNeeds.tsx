'use client'

import { CalendarDays } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption } from '@/lib/api/options'
import { cn } from '@/lib/utils'

const superviseeFeeTypeOptions: SelectOption[] = [
  { value: 'per-session', label: 'Per Session' },
  { value: 'monthly', label: 'Monthly' },
]

type SuperviseeStepSupervisionNeedsProps = {
  occupationOptions: SelectOption[]
  occupationsLoading: boolean
  stateOptions: SelectOption[]
  supervisorTypeOptions: SelectOption[]
  howSoonOptions: SelectOption[]
  availabilityOptions: SelectOption[]
  salaryRangeOptions: SelectOption[]
  statesLoading: boolean
  supervisorTypesLoading: boolean
  howSoonLoading: boolean
  availabilityLoading: boolean
  salaryRangesLoading: boolean
  isSubmitting: boolean
}

export function SuperviseeStepSupervisionNeeds({
  occupationOptions,
  occupationsLoading,
  stateOptions,
  supervisorTypeOptions,
  howSoonOptions,
  availabilityOptions,
  salaryRangeOptions,
  statesLoading,
  supervisorTypesLoading,
  howSoonLoading,
  availabilityLoading,
  salaryRangesLoading,
  isSubmitting,
}: SuperviseeStepSupervisionNeedsProps) {
  const { control, clearErrors } = useFormContext<SuperviseeFormValues>()
  const howSoon = useWatch({ control, name: 'howSoon' })
  const isCustomDate = howSoon === 'CUSTOM_DATE'
  const today = new Date().toISOString().split('T')[0]

  return (
    <FormSection title="Supervision Needs">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <FormSelectField
          control={control}
          name="occupationId"
          label="Occupation"
          rules={superviseeFieldRules('occupationId')}
          options={occupationOptions}
          placeholder="Select occupation"
          loading={occupationsLoading}
          isSubmitting={isSubmitting}
          required
        />
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
        <FormSelectField
          control={control}
          name="stateTheyAreLookingIn"
          label="State You Are Looking In"
          rules={superviseeFieldRules('stateTheyAreLookingIn')}
          options={stateOptions}
          placeholder="Select state"
          loading={statesLoading}
          isSubmitting={isSubmitting}
          required
        />
        <FormSelectField
          control={control}
          name="typeOfSupervisor"
          label="Type of Supervisor Needed"
          rules={superviseeFieldRules('typeOfSupervisor')}
          options={supervisorTypeOptions}
          placeholder="Select type"
          loading={supervisorTypesLoading}
          isSubmitting={isSubmitting}
          required
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
