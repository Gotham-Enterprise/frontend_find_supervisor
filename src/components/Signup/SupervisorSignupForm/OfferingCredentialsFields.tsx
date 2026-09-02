'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { LicenseEntriesField } from '@/components/forms/LicenseEntriesField'
import type { MedicalDirectorFormValues, OfferingKey } from '@/components/Signup/schema'
import { offeringFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormSelectField } from '@/components/ui/form-select-field'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import { getSupervisorCredentialSelectOptions } from '@/lib/utils/supervisor-type'

/** Select does not allow `SelectItem value=""`; map to empty specialty in the form. */
const SPECIALTY_NONE_VALUE = '__none__'

type OfferingCredentialsFieldsProps = {
  offeringKey: OfferingKey
  title: string
  /** The offering's supervisor-type hierarchy entry (occupations, degree types, specialties). */
  typeData: SupervisorTypeData | undefined
  stateOptions: SelectOption[]
  supervisorTypesLoading: boolean
  isSubmitting: boolean
}

/**
 * Credentials block for one checked Medical Director offering — mirrors the
 * physician portion of the supervisor License & Credentials step (occupation,
 * specialty, degree type, license entries). Person-level fields (NPI, years
 * of experience, license doc) stay on the main block.
 */
export function OfferingCredentialsFields({
  offeringKey,
  title,
  typeData,
  stateOptions,
  supervisorTypesLoading,
  isSubmitting,
}: OfferingCredentialsFieldsProps) {
  const { control, setValue, clearErrors } = useFormContext<MedicalDirectorFormValues>()
  const occupationValue = useWatch({ control, name: `offerings.${offeringKey}.occupation` }) ?? ''

  const occupationOptions = useMemo<SelectOption[]>(
    () => typeData?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [],
    [typeData],
  )

  const selectedOccupation = useMemo(
    () => typeData?.occupations.find((o) => o.name === occupationValue),
    [typeData, occupationValue],
  )

  const degreeOptions = useMemo<SelectOption[]>(
    () => getSupervisorCredentialSelectOptions(typeData, selectedOccupation),
    [typeData, selectedOccupation],
  )

  const specialtyOptions = useMemo<SelectOption[]>(
    () => selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [],
    [selectedOccupation],
  )

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-sm font-semibold">{title}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name={`offerings.${offeringKey}.occupation`}
          label="Occupation"
          rules={offeringFieldRules(offeringKey, 'occupation')}
          options={occupationOptions}
          placeholder={supervisorTypesLoading ? 'Loading…' : 'Select Occupation'}
          loading={supervisorTypesLoading}
          disabled={supervisorTypesLoading}
          isSubmitting={isSubmitting}
          required
          onValueChange={() => {
            setValue(`offerings.${offeringKey}.specialty`, '')
            setValue(`offerings.${offeringKey}.degreeType`, '')
            clearErrors([
              `offerings.${offeringKey}.specialty`,
              `offerings.${offeringKey}.degreeType`,
            ])
          }}
        />
        <FormSelectField
          control={control}
          name={`offerings.${offeringKey}.specialty`}
          label="Specialty"
          options={specialtyOptions}
          sortOptions
          placeholder="Select Specialty (optional)"
          loading={supervisorTypesLoading}
          disabled={supervisorTypesLoading || !occupationValue}
          isSubmitting={isSubmitting}
          emptySentinel={{ value: SPECIALTY_NONE_VALUE, label: 'None' }}
          selectKey={`${offeringKey}-${occupationValue}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name={`offerings.${offeringKey}.degreeType`}
          label="Degree Type"
          rules={offeringFieldRules(offeringKey, 'degreeType')}
          options={degreeOptions}
          placeholder="Select Degree Type"
          loading={supervisorTypesLoading}
          disabled={supervisorTypesLoading}
          selectKey={`${offeringKey}-${occupationValue}`}
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <LicenseEntriesField
        name={`offerings.${offeringKey}.licenses`}
        licenseTypeOptions={[]}
        stateOptions={stateOptions}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
