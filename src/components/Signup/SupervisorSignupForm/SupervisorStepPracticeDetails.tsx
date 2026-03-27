'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { supervisionFeeTypeOptions, type SupervisorFormValues } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption } from '@/lib/api/options'

type SupervisorStepPracticeDetailsProps = {
  patientPopulationOptions: SelectOption[]
  availabilityOptions: SelectOption[]
  patientPopulationsLoading: boolean
  availabilityLoading: boolean
}

export function SupervisorStepPracticeDetails({
  patientPopulationOptions,
  availabilityOptions,
  patientPopulationsLoading,
  availabilityLoading,
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
                  disabled={patientPopulationsLoading}
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="availability"
            rules={supervisorFieldRules('availability')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Availability <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={availabilityLoading}
                  itemToStringLabel={(val) =>
                    availabilityOptions.find((o) => o.value === val)?.label ?? val
                  }
                >
                  <FormControl>
                    <SelectTrigger>
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
          <FormField
            control={control}
            name="supervisionFeeType"
            rules={supervisorFieldRules('supervisionFeeType')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fee Type <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={supervisionFeeTypeOptions.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Hourly or Monthly" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supervisionFeeTypeOptions.map((opt) => (
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
            name="supervisionFeeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fee Amount <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 100"
                    startAdornment="$"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsNumber)
                      clearErrors(field.name)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
