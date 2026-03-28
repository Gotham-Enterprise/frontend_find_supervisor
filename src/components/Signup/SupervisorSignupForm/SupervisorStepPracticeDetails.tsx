'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { supervisionFeeTypeOptions, type SupervisorFormValues } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption } from '@/lib/api/options'

const supervisionFeeSelectOptions: SelectOption[] = supervisionFeeTypeOptions.map((o) => ({
  value: o.value,
  label: o.label,
}))

type SupervisorStepPracticeDetailsProps = {
  patientPopulationOptions: SelectOption[]
  availabilityOptions: SelectOption[]
  patientPopulationsLoading: boolean
  availabilityLoading: boolean
  isSubmitting: boolean
}

export function SupervisorStepPracticeDetails({
  patientPopulationOptions,
  availabilityOptions,
  patientPopulationsLoading,
  availabilityLoading,
  isSubmitting,
}: SupervisorStepPracticeDetailsProps) {
  const { control, clearErrors } = useFormContext<SupervisorFormValues>()
  const professionalSummaryValue = useWatch({ control, name: 'professionalSummary' }) ?? ''
  const describeYourselfValue = useWatch({ control, name: 'describeYourself' }) ?? ''

  return (
    <>
      <FormSection title="Practice Details">
        <FormField
          control={control}
          name="patientPopulation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Patient Population <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={patientPopulationOptions.sort((a, b) => a.label.localeCompare(b.label))}
                  value={field.value ?? []}
                  onChange={(v) => {
                    field.onChange(v)
                    clearErrors(field.name)
                  }}
                  placeholder={
                    patientPopulationsLoading ? 'Loading…' : 'Add population (e.g. Adults)'
                  }
                  disabled={patientPopulationsLoading || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="supervisionFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Supervision Format <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FormatSelector
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v)
                    clearErrors(field.name)
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelectField
            control={control}
            name="availability"
            label="Availability"
            rules={supervisorFieldRules('availability')}
            options={availabilityOptions}
            placeholder="Select availability"
            loading={availabilityLoading}
            required
            itemToStringLabel={(val) =>
              availabilityOptions.find((o) => o.value === val)?.label ?? String(val ?? '')
            }
            isSubmitting={isSubmitting}
          />
          <FormField
            control={control}
            name="acceptingNewSupervisees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accepting New Supervisees?</FormLabel>
                <FormControl>
                  <div className="flex h-10 items-center justify-between rounded-lg border border-input bg-card px-3">
                    <span className="text-sm text-muted-foreground">
                      {field.value ? 'Yes, accepting now' : 'Not accepting now'}
                    </span>
                    <Switch
                      checked={field.value}
                      disabled={isSubmitting}
                      onCheckedChange={(v) => {
                        field.onChange(v)
                        clearErrors(field.name)
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelectField
            control={control}
            name="supervisionFeeType"
            label="Fee Type"
            rules={supervisorFieldRules('supervisionFeeType')}
            options={supervisionFeeSelectOptions}
            placeholder="Hourly or Monthly"
            isSubmitting={isSubmitting}
            required
          />
          <FormInputField
            control={control}
            name="supervisionFeeAmount"
            label="Fee Amount"
            type="number"
            min={1}
            placeholder="e.g. 100"
            startAdornment="$"
            numberValue
            clearErrorsOnChange
            isSubmitting={isSubmitting}
            required
          />
        </div>

        <FormField
          control={control}
          name="professionalSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Professional Summary <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Specializing in orthopedic and sports rehabilitation with extensive experience supervising new graduates..."
                  maxLength={500}
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    clearErrors(field.name)
                  }}
                />
              </FormControl>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {professionalSummaryValue.length} / 500 characters
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="describeYourself"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Describe Yourself <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Share your background, approach to supervision, and what makes your practice unique..."
                  maxLength={500}
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    clearErrors(field.name)
                  }}
                />
              </FormControl>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {describeYourselfValue.length} / 500 characters
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <div className="space-y-4 border-t border-border pt-6">
        <FormField
          control={control}
          name="agreedToPost"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={(v) => {
                      field.onChange(v)
                      clearErrors(field.name)
                    }}
                    className="mt-0.5 shrink-0"
                  />
                </FormControl>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I agree to post my profile on{' '}
                  <span className="font-semibold text-primary">Gotham Enterprises Ltd</span> and
                  agree to be contacted by a prospective supervisee via email, messages on{' '}
                  <span className="font-semibold text-primary">Gotham Enterprises Ltd</span>, SMS
                  text, and phone.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="agreedToTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={(v) => {
                      field.onChange(v)
                      clearErrors(field.name)
                    }}
                    className="mt-0.5 shrink-0"
                  />
                </FormControl>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I agree to all of the terms and conditions of use on{' '}
                  <span className="font-semibold text-primary">Gotham Enterprises Ltd</span>.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
