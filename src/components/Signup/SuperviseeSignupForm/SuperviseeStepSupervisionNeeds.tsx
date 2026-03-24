'use client'

import { useFormContext } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption } from '@/lib/api/options'

type SuperviseeStepSupervisionNeedsProps = {
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
}

export function SuperviseeStepSupervisionNeeds({
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
}: SuperviseeStepSupervisionNeedsProps) {
  const { control } = useFormContext<SuperviseeFormValues>()

  return (
    <FormSection title="Supervision Needs">
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
                  }}
                  placeholder="Add a state (e.g. CA)"
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
            <FormItem>
              <FormLabel>
                State You Are Looking In <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={statesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return stateOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue placeholder={statesLoading ? 'Loading…' : 'Select state'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stateOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="typeOfSupervisor"
          rules={superviseeFieldRules('typeOfSupervisor')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Type of Supervisor Needed <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={supervisorTypesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return supervisorTypeOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue
                      placeholder={supervisorTypesLoading ? 'Loading…' : 'Select type'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supervisorTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="howSoon"
          rules={superviseeFieldRules('howSoon')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How Soon Do You Need Supervision? <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={howSoonLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return howSoonOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue placeholder={howSoonLoading ? 'Loading…' : 'Select timeframe'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {howSoonOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="availability"
          rules={superviseeFieldRules('availability')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Availability <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={availabilityLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return availabilityOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue
                      placeholder={availabilityLoading ? 'Loading…' : 'Select availability'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availabilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="feeType"
          rules={superviseeFieldRules('feeType')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Fee Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                itemToStringLabel={(val) =>
                  val === 'per-session'
                    ? 'Per Session'
                    : val === 'monthly'
                      ? 'Monthly'
                      : String(val ?? '')
                }
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="per-session">Per Session</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="budgetRange"
          rules={superviseeFieldRules('budgetRange')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Budget Range <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={salaryRangesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return salaryRangeOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue placeholder={salaryRangesLoading ? 'Loading…' : 'Select budget'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {salaryRangeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  )
}
