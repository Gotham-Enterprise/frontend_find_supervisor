'use client'

import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import {
  SUPERVISEE_CREDENTIAL_TITLE_LABEL,
  SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER,
} from '@/lib/forms/supervisee-profile-edit'
import { useSpecialtiesByOccupation } from '@/lib/hooks/useSignupOptions'
import { cn } from '@/lib/utils'
import { todayLocalISO } from '@/lib/utils/date'
import {
  getEligibleSupervisorTypes,
  hasCompletedEligibilityFields,
  INELIGIBLE_SUPERVISION_TYPE_MESSAGE,
  isSupervisorTypeEligibleForSupervisee,
  NO_ELIGIBLE_SUPERVISION_TYPES_PLACEHOLDER,
  reconcileSelectedSupervisorType,
  type SuperviseeEligibilityContext,
  SUPERVISION_TYPE_LOCKED_PLACEHOLDER,
  SUPERVISION_TYPE_REQUIRED_MESSAGE,
} from '@/lib/utils/supervisee-eligibility'

const superviseeFeeTypeOptions: SelectOption[] = [
  { value: 'per-session', label: 'Per Session' },
  { value: 'monthly', label: 'Monthly' },
]

type SuperviseeStepSupervisionNeedsProps = {
  supervisorTypesData: SupervisorTypeData[]
  supervisorTypesLoading: boolean
  occupationOptions: SelectOption[]
  occupationsLoading: boolean
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
  occupationOptions,
  occupationsLoading,
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
  const typeOfSupervisor = useWatch({ control, name: 'typeOfSupervisor' }) ?? ''
  const needsMedicalDirector = useWatch({ control, name: 'needsMedicalDirector' }) ?? false
  const title = useWatch({ control, name: 'title' }) ?? ''
  const occupationId = useWatch({ control, name: 'occupationId' }) ?? ''
  const isCustomDate = howSoon === 'CUSTOM_DATE'
  // Local date, not toISOString() — the UTC date blocks "today" in US timezones each evening
  const today = todayLocalISO()

  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' }) ?? ''

  const { data: specialtyOptions = [], isLoading: specialtiesLoading } =
    useSpecialtiesByOccupation(occupationId)

  // Desired supervisor's occupation/specialty, cascading from the selected supervision type.
  const supervisionOccupationOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisor) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisor)
    return selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []
  }, [typeOfSupervisor, supervisorTypesData])

  const supervisionSpecialtyOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisor || !supervisorOccupationId) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisor)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [typeOfSupervisor, supervisorOccupationId, supervisorTypesData])

  const occupationName = useMemo(
    () => occupationOptions.find((o) => o.value === occupationId)?.label ?? '',
    [occupationOptions, occupationId],
  )
  const eligibilityCtx: SuperviseeEligibilityContext = useMemo(
    () => ({ occupationName, credentialTitle: title }),
    [occupationName, title],
  )
  const eligibilityComplete = hasCompletedEligibilityFields(eligibilityCtx)

  // Only eligible supervision types are offered; Medical Director is excluded — it is
  // requested via the checkbox below the dropdown instead.
  const supervisorTypeOptions = useMemo<SelectOption[]>(
    () =>
      getEligibleSupervisorTypes(supervisorTypesData, eligibilityCtx).map((t) => ({
        label: t.name,
        value: t.name,
      })),
    [supervisorTypesData, eligibilityCtx],
  )

  // Clear a previously selected supervision type that became ineligible after the
  // credential/occupation changed.
  useEffect(() => {
    const reconciled = reconcileSelectedSupervisorType(
      typeOfSupervisor,
      supervisorTypesData,
      eligibilityCtx,
    )
    if (reconciled !== typeOfSupervisor) {
      setValue('typeOfSupervisor', reconciled)
      setValue('supervisorOccupationId', '')
      setValue('supervisorSpecialtyId', '')
      clearErrors(['typeOfSupervisor', 'supervisorOccupationId', 'supervisorSpecialtyId'])
    }
  }, [typeOfSupervisor, supervisorTypesData, eligibilityCtx, setValue, clearErrors])

  // Possible now that Medical Director is not a dropdown option: a supervisee whose
  // credentials match no supervision type signs up via the Medical Director checkbox alone.
  const noEligibleTypes =
    !supervisorTypesLoading && eligibilityComplete && supervisorTypeOptions.length === 0
  const supervisionTypeDisabled = supervisorTypesLoading || !eligibilityComplete || noEligibleTypes

  return (
    <>
      {/* ── Supervisee profile fields — collected here (before Step 3) because they
          determine supervision-type eligibility ── */}
      <FormSection title="Professional Background">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            onValueChange={() => {
              setValue('specialtyId', '')
              clearErrors('specialtyId')
            }}
          />

          <FormSelectField
            control={control}
            name="specialtyId"
            label="Specialty"
            options={specialtyOptions}
            sortOptions
            placeholder={
              !occupationId
                ? 'Select an occupation first'
                : specialtyOptions.length === 0 && !specialtiesLoading
                  ? 'No specialties available'
                  : 'Select specialty'
            }
            loading={specialtiesLoading}
            isSubmitting={isSubmitting || !occupationId}
            selectKey={occupationId}
          />
        </div>

        <FormInputField
          control={control}
          name="title"
          label={SUPERVISEE_CREDENTIAL_TITLE_LABEL}
          rules={superviseeFieldRules('title')}
          placeholder={SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER}
          isSubmitting={isSubmitting}
          required
        />
      </FormSection>

      <FormSection title="Supervision Needs">
        {/* ── Type of Supervision Needed (filtered by eligibility) ── */}
        <FormSelectField
          control={control}
          name="typeOfSupervisor"
          label="Type of Supervision Needed"
          rules={{
            validate: (value: unknown, formValues: SuperviseeFormValues) => {
              if (!value) {
                return formValues.needsMedicalDirector ? true : SUPERVISION_TYPE_REQUIRED_MESSAGE
              }
              const selected = supervisorTypesData.find((t) => t.name === value)
              if (selected && !isSupervisorTypeEligibleForSupervisee(selected, eligibilityCtx)) {
                return INELIGIBLE_SUPERVISION_TYPE_MESSAGE
              }
              return true
            },
          }}
          options={supervisorTypeOptions}
          placeholder={
            supervisorTypesLoading
              ? 'Loading…'
              : !eligibilityComplete
                ? SUPERVISION_TYPE_LOCKED_PLACEHOLDER
                : noEligibleTypes
                  ? NO_ELIGIBLE_SUPERVISION_TYPES_PLACEHOLDER
                  : 'Select type of supervision'
          }
          loading={supervisorTypesLoading}
          disabled={supervisionTypeDisabled}
          isSubmitting={isSubmitting}
          selectKey={occupationId}
          required={!needsMedicalDirector}
          onValueChange={() => {
            setValue('supervisorOccupationId', '')
            setValue('supervisorSpecialtyId', '')
            clearErrors(['supervisorOccupationId', 'supervisorSpecialtyId'])
          }}
        />

        {/* ── Medical Director — combinable with any supervision type, or standalone ── */}
        <FormField
          control={control}
          name="needsMedicalDirector"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true)
                      if (checked === true) clearErrors('typeOfSupervisor')
                    }}
                    className="mt-0.5 shrink-0"
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">I need a Medical Director</p>
                  <p className="text-sm text-muted-foreground">
                    Can be combined with a supervision type above, or selected on its own.
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Desired supervisor's occupation/specialty (filtered by supervision type) ── */}
        <FormSelectField
          control={control}
          name="supervisorOccupationId"
          label="Occupation"
          rules={{
            // Required only when a supervision type is selected — a Medical Director-only
            // request has no type, so no occupation cascade to fill in.
            validate: (value: unknown, formValues: SuperviseeFormValues) =>
              formValues.typeOfSupervisor && !value ? 'Occupation is required' : true,
          }}
          options={supervisionOccupationOptions}
          placeholder={
            !typeOfSupervisor
              ? 'Select a type of supervision first'
              : supervisionOccupationOptions.length === 0
                ? 'No occupations available'
                : 'Select occupation'
          }
          loading={supervisorTypesLoading}
          isSubmitting={isSubmitting || !typeOfSupervisor}
          selectKey={typeOfSupervisor}
          required={Boolean(typeOfSupervisor)}
          onValueChange={() => {
            setValue('supervisorSpecialtyId', '')
            clearErrors('supervisorSpecialtyId')
          }}
        />

        <FormSelectField
          control={control}
          name="supervisorSpecialtyId"
          label="Specialty"
          options={supervisionSpecialtyOptions}
          sortOptions
          placeholder={
            !supervisorOccupationId
              ? 'Select an occupation first'
              : supervisionSpecialtyOptions.length === 0
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
    </>
  )
}
