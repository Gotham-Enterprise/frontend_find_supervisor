'use client'

import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import { cn } from '@/lib/utils'
import { todayLocalISO } from '@/lib/utils/date'
import { isMedicalDirectorType } from '@/lib/utils/supervisee-eligibility'

/** Form fields that belong to the Medical Director block (cleared when unchecked). */
const MD_PREFERENCE_FIELDS = [
  'mdPreferredOccupationId',
  'mdPreferredSpecialtyId',
  'mdHowSoon',
  'mdHowSoonDate',
  'mdMonthlyBudget',
  'mdIdealDescription',
] as const

type MdHierarchyProps = {
  supervisorTypesData: SupervisorTypeData[]
  supervisorTypesLoading: boolean
  isSubmitting: boolean
}

/** The Medical Director type's occupations feed the preference selects. */
function useMedicalDirectorType(supervisorTypesData: SupervisorTypeData[]) {
  return useMemo(
    () => supervisorTypesData.find((t) => isMedicalDirectorType(t)),
    [supervisorTypesData],
  )
}

export function MdPreferredOccupationSelect({
  supervisorTypesData,
  supervisorTypesLoading,
  isSubmitting,
}: MdHierarchyProps) {
  const { control, clearErrors, setValue } = useFormContext<SuperviseeFormValues>()
  const medicalDirectorType = useMedicalDirectorType(supervisorTypesData)
  const options = useMemo<SelectOption[]>(
    () => medicalDirectorType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [],
    [medicalDirectorType],
  )

  return (
    <FormSelectField
      control={control}
      name="mdPreferredOccupationId"
      label="Preferred Occupation (optional)"
      options={options}
      placeholder={
        options.length === 0 && !supervisorTypesLoading
          ? 'No Occupations Available'
          : 'Select Preferred Occupation'
      }
      loading={supervisorTypesLoading}
      isSubmitting={isSubmitting}
      onValueChange={() => {
        setValue('mdPreferredSpecialtyId', '')
        clearErrors('mdPreferredSpecialtyId')
      }}
    />
  )
}

export function MdPreferredSpecialtySelect({
  supervisorTypesData,
  supervisorTypesLoading,
  isSubmitting,
}: MdHierarchyProps) {
  const { control } = useFormContext<SuperviseeFormValues>()
  const mdPreferredOccupationId = useWatch({ control, name: 'mdPreferredOccupationId' }) ?? ''
  const medicalDirectorType = useMedicalDirectorType(supervisorTypesData)
  const options = useMemo<SelectOption[]>(() => {
    if (!mdPreferredOccupationId) return []
    const selectedOccupation = medicalDirectorType?.occupations.find(
      (o) => o.name === mdPreferredOccupationId,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [medicalDirectorType, mdPreferredOccupationId])

  return (
    <FormSelectField
      control={control}
      name="mdPreferredSpecialtyId"
      label="Preferred Specialty (optional)"
      options={options}
      sortOptions
      placeholder={
        !mdPreferredOccupationId
          ? 'Select a Preferred Occupation First'
          : options.length === 0
            ? 'No Specialties Available'
            : 'Select Specialty'
      }
      loading={supervisorTypesLoading}
      isSubmitting={isSubmitting || !mdPreferredOccupationId}
      selectKey={`md-${mdPreferredOccupationId}`}
    />
  )
}

type MdHowSoonSelectProps = {
  label: string
  howSoonOptions: SelectOption[]
  howSoonLoading: boolean
  isSubmitting: boolean
}

export function MdHowSoonSelect({
  label,
  howSoonOptions,
  howSoonLoading,
  isSubmitting,
}: MdHowSoonSelectProps) {
  const { control } = useFormContext<SuperviseeFormValues>()
  return (
    <FormSelectField
      control={control}
      name="mdHowSoon"
      label={label}
      rules={superviseeFieldRules('mdHowSoon')}
      options={howSoonOptions}
      placeholder="Select Timeframe"
      loading={howSoonLoading}
      isSubmitting={isSubmitting}
      required
    />
  )
}

/** Renders only while mdHowSoon is CUSTOM_DATE. */
export function MdHowSoonDateInput({ isSubmitting }: { isSubmitting: boolean }) {
  const { control, clearErrors } = useFormContext<SuperviseeFormValues>()
  const mdHowSoon = useWatch({ control, name: 'mdHowSoon' })
  // Local date, not toISOString() — the UTC date blocks "today" in US timezones each evening
  const today = todayLocalISO()
  if (mdHowSoon !== 'CUSTOM_DATE') return null

  return (
    <FormField
      control={control}
      name="mdHowSoonDate"
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
                  clearErrors('mdHowSoonDate')
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
  )
}

export function MdMonthlyBudgetInput({
  label,
  isSubmitting,
}: {
  label: string
  isSubmitting: boolean
}) {
  const { control } = useFormContext<SuperviseeFormValues>()
  return (
    <FormInputField
      control={control}
      name="mdMonthlyBudget"
      label={label}
      type="number"
      min={1}
      placeholder="Enter Your Monthly Budget"
      startAdornment="$"
      numberValue
      clearErrorsOnChange
      isSubmitting={isSubmitting}
      required
    />
  )
}

type SuperviseeStepMedicalDirectorProps = {
  supervisorTypesData: SupervisorTypeData[]
  supervisorTypesLoading: boolean
  howSoonOptions: SelectOption[]
  howSoonLoading: boolean
  isSubmitting: boolean
}

/**
 * The regular supervisee flow's "Medical Director" section — slotted right
 * after the ideal-supervisor description at the end of Step 2. Checking the
 * box reveals the MD-specific required fields (md* columns on
 * SuperviseeProfile).
 */
export function SuperviseeStepMedicalDirector({
  supervisorTypesData,
  supervisorTypesLoading,
  howSoonOptions,
  howSoonLoading,
  isSubmitting,
}: SuperviseeStepMedicalDirectorProps) {
  const { control, clearErrors } = useFormContext<SuperviseeFormValues>()
  const needsMedicalDirector = useWatch({ control, name: 'needsMedicalDirector' }) ?? false
  const typeOfSupervisor = useWatch({ control, name: 'typeOfSupervisor' }) ?? ''
  const mdIdealDescriptionValue = useWatch({ control, name: 'mdIdealDescription' }) ?? ''
  // Combined signups get their own MD description; an MD-only signup reuses the
  // (relabeled) main description field, which the payload copies over.
  const showMdDescription = needsMedicalDirector && Boolean(typeOfSupervisor)

  return (
    <FormSection title="Medical Director">
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
                    if (checked === true) {
                      clearErrors('typeOfSupervisor')
                    } else {
                      clearErrors([...MD_PREFERENCE_FIELDS])
                    }
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

      {needsMedicalDirector && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MdHowSoonSelect
              label="How Soon Needed?"
              howSoonOptions={howSoonOptions}
              howSoonLoading={howSoonLoading}
              isSubmitting={isSubmitting}
            />
            <MdHowSoonDateInput isSubmitting={isSubmitting} />
            <MdMonthlyBudgetInput
              label="Monthly Budget for Medical Director"
              isSubmitting={isSubmitting}
            />
          </div>

          {showMdDescription && (
            <FormField
              control={control}
              name="mdIdealDescription"
              rules={superviseeFieldRules('mdIdealDescription')}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Describe Your Ideal Medical Director <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      maxLength={500}
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {mdIdealDescriptionValue.length} / 500 characters
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </FormSection>
  )
}
