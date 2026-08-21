'use client'

import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import {
  SUPERVISEE_CREDENTIAL_TITLE_LABEL,
  SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER,
} from '@/lib/forms/supervisee-profile-edit'
import { useStateNameOptions } from '@/lib/hooks'
import { useSpecialtiesByOccupation } from '@/lib/hooks/useSignupOptions'
import { cn } from '@/lib/utils'
import { todayLocalISO } from '@/lib/utils/date'
import {
  getEligibleSupervisorTypes,
  groupSuperviseeOccupationOptions,
  hasCompletedEligibilityFields,
  INELIGIBLE_SUPERVISION_TYPE_MESSAGE,
  isSupervisorTypeEligibleForSupervisee,
  NO_ELIGIBLE_SUPERVISION_TYPES_PLACEHOLDER,
  reconcileSelectedSupervisorType,
  SUPERVISION_TYPE_LOCKED_PLACEHOLDER,
  SUPERVISION_TYPE_REQUIRED_MESSAGE,
  supervisionTypeDisplayLabel,
} from '@/lib/utils/supervisee-eligibility'

import type { SuperviseeSignupVariant } from './index'
import {
  MdHowSoonDateInput,
  MdHowSoonSelect,
  MdMonthlyBudgetInput,
  MdPreferredOccupationSelect,
  MdPreferredSpecialtySelect,
} from './SuperviseeStepMedicalDirector'

const superviseeFeeTypeOptions: SelectOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'monthly', label: 'Monthly' },
]

/** Supervision-only fields hidden (and skipped) when the signup is MD-only. */
const SUPERVISION_ONLY_FIELDS = [
  'supervisorOccupationId',
  'supervisorSpecialtyId',
  'howSoon',
  'howSoonDate',
  'feeType',
  'budgetRange',
  'monthlyBudget',
] as const

type SuperviseeStepSupervisionNeedsProps = {
  /** 'need-medical-director' hides the supervision-type UI and renders the
   *  Medical Director preference set (md* fields) as the section itself. */
  variant?: SuperviseeSignupVariant
  supervisorTypesData: SupervisorTypeData[]
  supervisorTypesLoading: boolean
  occupationOptions: SelectOption[]
  occupationsLoading: boolean
  stateOptions: SelectOption[]
  howSoonOptions: SelectOption[]
  availabilityOptions: SelectOption[]
  salaryRangeOptions: SelectOption[]
  howSoonLoading: boolean
  availabilityLoading: boolean
  salaryRangesLoading: boolean
  isSubmitting: boolean
}

export function SuperviseeStepSupervisionNeeds({
  variant = 'supervisee',
  supervisorTypesData,
  supervisorTypesLoading,
  occupationOptions,
  occupationsLoading,
  stateOptions,
  howSoonOptions,
  availabilityOptions,
  salaryRangeOptions,
  howSoonLoading,
  availabilityLoading,
  salaryRangesLoading,
  isSubmitting,
}: SuperviseeStepSupervisionNeedsProps) {
  const isNeedMedicalDirector = variant === 'need-medical-director'
  const { control, clearErrors, setValue } = useFormContext<SuperviseeFormValues>()
  const howSoon = useWatch({ control, name: 'howSoon' })
  const typeOfSupervisor = useWatch({ control, name: 'typeOfSupervisor' }) ?? ''
  const needsMedicalDirector = useWatch({ control, name: 'needsMedicalDirector' }) ?? false
  const occupationId = useWatch({ control, name: 'occupationId' }) ?? ''
  const feeType = useWatch({ control, name: 'feeType' })
  const isCustomDate = howSoon === 'CUSTOM_DATE'
  // Local date, not toISOString() — the UTC date blocks "today" in US timezones each evening
  const today = todayLocalISO()

  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' }) ?? ''

  // MD-only signup in the regular flow: checkbox ticked without a supervision
  // type — the supervision-only preference fields are hidden and skipped.
  const isMdOnly = !isNeedMedicalDirector && needsMedicalDirector && !typeOfSupervisor
  const showSupervisionFields = !isNeedMedicalDirector && !isMdOnly

  const { data: specialtyOptions = [], isLoading: specialtiesLoading } =
    useSpecialtiesByOccupation(occupationId)

  // Full state names ("Alabama") for the credential's state; value stays the abbreviation
  const { data: licensureStateOptions = [], isLoading: licensureStatesLoading } =
    useStateNameOptions()

  // Supervision-type cascade for the desired supervisor's occupation/specialty.
  const selectedSupervisionType = useMemo(() => {
    if (!typeOfSupervisor) return undefined
    return supervisorTypesData.find((t) => t.name === typeOfSupervisor)
  }, [typeOfSupervisor, supervisorTypesData])

  const supervisionOccupationOptions = useMemo<SelectOption[]>(
    () => selectedSupervisionType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [],
    [selectedSupervisionType],
  )

  const supervisionSpecialtyOptions = useMemo<SelectOption[]>(() => {
    if (!supervisorOccupationId) return []
    const selectedOccupation = selectedSupervisionType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [selectedSupervisionType, supervisorOccupationId])

  const occupationName = useMemo(
    () => occupationOptions.find((o) => o.value === occupationId)?.label ?? '',
    [occupationOptions, occupationId],
  )

  // Medical (NP/PA) on top, Mental Health below. The dedicated Medical Director flow
  // keeps a flat list — its occupation dropdown is unfiltered, so most entries would
  // land in a meaningless "Other" bucket.
  const occupationGroups = useMemo(
    () => (isNeedMedicalDirector ? undefined : groupSuperviseeOccupationOptions(occupationOptions)),
    [isNeedMedicalDirector, occupationOptions],
  )
  const eligibilityComplete = hasCompletedEligibilityFields(occupationName)

  // Only eligible supervision types are offered; Medical Director is excluded — it is
  // requested via the checkbox in its own section instead.
  const supervisorTypeOptions = useMemo<SelectOption[]>(
    () =>
      getEligibleSupervisorTypes(supervisorTypesData, occupationName).map((t) => ({
        label: supervisionTypeDisplayLabel(t.name),
        value: t.name,
      })),
    [supervisorTypesData, occupationName],
  )

  // Clear a previously selected supervision type that became ineligible after the
  // occupation changed.
  useEffect(() => {
    const reconciled = reconcileSelectedSupervisorType(
      typeOfSupervisor,
      supervisorTypesData,
      occupationName,
    )
    if (reconciled !== typeOfSupervisor) {
      setValue('typeOfSupervisor', reconciled)
      setValue('supervisorOccupationId', '')
      setValue('supervisorSpecialtyId', '')
      clearErrors(['typeOfSupervisor', 'supervisorOccupationId', 'supervisorSpecialtyId'])
    }
  }, [typeOfSupervisor, supervisorTypesData, occupationName, setValue, clearErrors])

  // Hidden supervision-only fields must not keep stale errors once the signup
  // becomes MD-only.
  useEffect(() => {
    if (isMdOnly) clearErrors([...SUPERVISION_ONLY_FIELDS])
  }, [isMdOnly, clearErrors])

  // Possible now that Medical Director is not a dropdown option: a supervisee whose
  // occupation matches no supervision type signs up via the Medical Director checkbox alone.
  const noEligibleTypes =
    !supervisorTypesLoading && eligibilityComplete && supervisorTypeOptions.length === 0
  const supervisionTypeDisabled = supervisorTypesLoading || !eligibilityComplete || noEligibleTypes

  return (
    <>
      {/* ── Supervisee profile fields — collected here (before Step 3) because the
          occupation determines supervision-type eligibility ── */}
      <FormSection title="Professional Background">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelectField
            control={control}
            name="occupationId"
            label="Occupation"
            searchable
            rules={superviseeFieldRules('occupationId')}
            options={occupationOptions}
            groups={occupationGroups}
            placeholder="Select Occupation"
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
                ? 'Select an Occupation First'
                : specialtyOptions.length === 0 && !specialtiesLoading
                  ? 'No Specialties Available'
                  : 'Select Specialty'
            }
            loading={specialtiesLoading}
            isSubmitting={isSubmitting || !occupationId}
            selectKey={occupationId}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInputField
            control={control}
            name="title"
            label={SUPERVISEE_CREDENTIAL_TITLE_LABEL}
            rules={superviseeFieldRules('title')}
            placeholder={SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER}
            isSubmitting={isSubmitting}
            required
          />

          {/* State tied to the credential — US convention pairs the state with the
              credential (e.g. "TX LPC-A"); stored as the abbreviation */}
          <FormSelectField
            control={control}
            name="licensureState"
            label="State of Licensure"
            searchable
            rules={superviseeFieldRules('licensureState')}
            options={licensureStateOptions}
            placeholder="Select State"
            loading={licensureStatesLoading}
            isSubmitting={isSubmitting}
            required
          />
        </div>
      </FormSection>

      <FormSection
        title={
          isNeedMedicalDirector
            ? 'Medical Director Preferences'
            : isMdOnly
              ? 'Preferences'
              : 'Supervision Needs'
        }
      >
        {/* ── Type of Supervision Needed (filtered by eligibility) — hidden in the
            dedicated flow where the preset needsMedicalDirector covers the need ── */}
        {!isNeedMedicalDirector && (
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
                if (selected && !isSupervisorTypeEligibleForSupervisee(selected, occupationName)) {
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
                    : 'Select Type of Supervision'
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
        )}

        {/* ── Desired supervisor's occupation/specialty — cascades from the selected
            supervision type; hidden for an MD-only signup ── */}
        {showSupervisionFields && (
          <>
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
                  ? 'Select a Type of Supervision First'
                  : supervisionOccupationOptions.length === 0
                    ? 'No Occupations Available'
                    : 'Select Occupation'
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
                  ? 'Select an Occupation First'
                  : supervisionSpecialtyOptions.length === 0
                    ? 'No Specialties Available'
                    : 'Select Specialty'
              }
              loading={supervisorTypesLoading}
              isSubmitting={isSubmitting || !supervisorOccupationId}
              selectKey={`${typeOfSupervisor}-${supervisorOccupationId}`}
            />
          </>
        )}

        {/* ── Dedicated flow: the MD preference selects lead the section ── */}
        {isNeedMedicalDirector && (
          <>
            <MdPreferredOccupationSelect
              supervisorTypesData={supervisorTypesData}
              supervisorTypesLoading={supervisorTypesLoading}
              isSubmitting={isSubmitting}
            />
            <MdPreferredSpecialtySelect
              supervisorTypesData={supervisorTypesData}
              supervisorTypesLoading={supervisorTypesLoading}
              isSubmitting={isSubmitting}
            />
          </>
        )}

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
                    placeholder="Add a State (e.g. CA)"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {showSupervisionFields && (
            <div className="flex flex-col gap-3">
              <FormSelectField
                control={control}
                name="howSoon"
                label="How Soon Do You Need Supervision?"
                rules={superviseeFieldRules('howSoon')}
                options={howSoonOptions}
                placeholder="Select Timeframe"
                loading={howSoonLoading}
                isSubmitting={isSubmitting}
                required
              />
            </div>
          )}

          {showSupervisionFields && isCustomDate && (
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

          {isNeedMedicalDirector && (
            <div className="flex flex-col gap-3">
              <MdHowSoonSelect
                label="How Soon Do You Need a Medical Director?"
                howSoonOptions={howSoonOptions}
                howSoonLoading={howSoonLoading}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
          {isNeedMedicalDirector && <MdHowSoonDateInput isSubmitting={isSubmitting} />}

          <FormSelectField
            control={control}
            name="availability"
            label="Availability"
            rules={superviseeFieldRules('availability')}
            options={availabilityOptions}
            placeholder="Select Availability"
            loading={availabilityLoading}
            isSubmitting={isSubmitting}
            required
          />
        </div>

        {/* ── Supervision fee — hidden for an MD-only signup; the MD budget lives
            in the Medical Director block ── */}
        {showSupervisionFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="feeType"
              label="Fee Type"
              rules={superviseeFieldRules('feeType')}
              options={superviseeFeeTypeOptions}
              placeholder="Select Fee Type"
              isSubmitting={isSubmitting}
              required
              onValueChange={() => {
                clearErrors(['budgetRange', 'monthlyBudget'])
              }}
            />
            {feeType === 'monthly' ? (
              <FormInputField
                control={control}
                name="monthlyBudget"
                label="Monthly Budget"
                type="number"
                min={1}
                placeholder="Enter Your Monthly Budget"
                startAdornment="$"
                numberValue
                clearErrorsOnChange
                isSubmitting={isSubmitting}
                required
              />
            ) : (
              <FormSelectField
                control={control}
                name="budgetRange"
                label="Budget Range"
                rules={superviseeFieldRules('budgetRange')}
                options={salaryRangeOptions}
                placeholder="Select Budget"
                loading={salaryRangesLoading}
                isSubmitting={isSubmitting}
                required
              />
            )}
          </div>
        )}

        {isNeedMedicalDirector && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MdMonthlyBudgetInput label="Monthly Budget" isSubmitting={isSubmitting} />
          </div>
        )}
      </FormSection>
    </>
  )
}
