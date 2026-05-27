'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SupervisorFormValues, yearsOfExperienceOptions } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import { UploadFile } from '@/components/ui/upload-file'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'

/** Select does not allow `SelectItem value=""`; map to empty `specialtyId` in the form. */
const SPECIALTY_NONE_VALUE = '__none__'

const yearsOfExperienceSelectOptions: SelectOption[] = yearsOfExperienceOptions.map((v) => ({
  value: v,
  label: v,
}))

type SupervisorStepLicenseCredentialsProps = {
  supervisorTypeOptions: SelectOption[]
  supervisorTypesData: SupervisorTypeData[]
  certificateOptions: SelectOption[]
  stateOptions: SelectOption[]
  supervisorTypesLoading: boolean
  certificatesLoading: boolean
  isSubmitting: boolean
}

export function SupervisorStepLicenseCredentials({
  supervisorTypeOptions,
  supervisorTypesData,
  certificateOptions,
  stateOptions,
  supervisorTypesLoading,
  certificatesLoading,
  isSubmitting,
}: SupervisorStepLicenseCredentialsProps) {
  const { control, clearErrors, setValue } = useFormContext<SupervisorFormValues>()
  const supervisorType = useWatch({ control, name: 'supervisorType' }) ?? ''
  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' }) ?? ''

  // Derive occupation options directly from the hierarchy for the selected supervisor type.
  const occupationOptions = useMemo<SelectOption[]>(() => {
    if (!supervisorType) return []
    const selectedType = supervisorTypesData.find((t) => t.name === supervisorType)
    return selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []
  }, [supervisorType, supervisorTypesData])

  // Derive license type options from the hierarchy for the selected occupation.
  const licenseTypeOptions = useMemo<SelectOption[]>(() => {
    if (!supervisorOccupationId) return []
    const selectedType = supervisorTypesData.find((t) => t.name === supervisorType)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return selectedOccupation?.licenseTypes.map((l) => ({ label: l.name, value: l.name })) ?? []
  }, [supervisorType, supervisorOccupationId, supervisorTypesData])

  // Derive specialty options from the hierarchy for the selected occupation.
  const specialtyOptions = useMemo<SelectOption[]>(() => {
    if (!supervisorType || !supervisorOccupationId) return []
    const selectedType = supervisorTypesData.find((t) => t.name === supervisorType)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [supervisorType, supervisorOccupationId, supervisorTypesData])

  const occupationDisabled = supervisorTypesLoading || !supervisorType
  const licenseTypeDisabled = supervisorTypesLoading || !supervisorOccupationId
  const specialtyDisabled = supervisorTypesLoading || supervisorOccupationId.length === 0

  return (
    <FormSection title="License & Credentials">
      <FormSelectField
        control={control}
        name="supervisorType"
        label="Supervisor Type"
        rules={supervisorFieldRules('supervisorType')}
        options={supervisorTypeOptions}
        placeholder={supervisorTypesLoading ? 'Loading…' : 'Select supervisor type'}
        loading={supervisorTypesLoading}
        isSubmitting={isSubmitting}
        required
        onValueChange={() => {
          setValue('supervisorOccupationId', '')
          setValue('supervisorSpecialtyId', '')
          setValue('licenseType', '')
          clearErrors(['supervisorOccupationId', 'supervisorSpecialtyId', 'licenseType'])
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="supervisorOccupationId"
          label="Occupation"
          rules={supervisorFieldRules('supervisorOccupationId')}
          options={occupationOptions}
          placeholder={occupationDisabled ? 'Select a supervisor type first' : 'Select occupation'}
          loading={supervisorTypesLoading}
          disabled={occupationDisabled}
          isSubmitting={isSubmitting}
          selectKey={supervisorType}
          required
          onValueChange={() => {
            setValue('supervisorSpecialtyId', '')
            setValue('licenseType', '')
            clearErrors(['supervisorSpecialtyId', 'licenseType'])
          }}
        />
        <FormSelectField
          control={control}
          name="supervisorSpecialtyId"
          label="Specialty"
          options={specialtyOptions}
          placeholder="Select specialty (optional)"
          loading={supervisorTypesLoading}
          disabled={specialtyDisabled}
          isSubmitting={isSubmitting}
          emptySentinel={{ value: SPECIALTY_NONE_VALUE, label: 'None' }}
          selectKey={`${supervisorType}-${supervisorOccupationId}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="licenseType"
          label="License Type"
          rules={supervisorFieldRules('licenseType')}
          options={licenseTypeOptions}
          placeholder={licenseTypeDisabled ? 'Select an occupation first' : 'Select license type'}
          loading={supervisorTypesLoading}
          disabled={licenseTypeDisabled}
          selectKey={supervisorOccupationId}
          isSubmitting={isSubmitting}
          required
        />
        <FormInputField
          control={control}
          name="licenseNumber"
          label="License Number"
          rules={supervisorFieldRules('licenseNumber')}
          placeholder="Enter License Number"
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputField
          control={control}
          name="licenseExpiration"
          label="License Expiration"
          rules={supervisorFieldRules('licenseExpiration')}
          type="date"
          normalizeEmptyToString
          isSubmitting={isSubmitting}
          required
        />
        <FormInputField
          control={control}
          name="npiNumber"
          label="NPI Number"
          rules={supervisorFieldRules('npiNumber')}
          placeholder="Enter your NPI Number"
          maxLength={20}
          isSubmitting={isSubmitting}
        />
      </div>

      <FormSelectField
        control={control}
        name="yearsOfExperience"
        label="Years of Experience"
        rules={supervisorFieldRules('yearsOfExperience')}
        options={yearsOfExperienceSelectOptions}
        placeholder="Select years of experience"
        isSubmitting={isSubmitting}
        required
      />

      <FormField
        control={control}
        name="certifications"
        rules={supervisorFieldRules('certifications')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Certifications <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <TagInput
                options={certificateOptions.sort((a, b) => a.label.localeCompare(b.label))}
                value={field.value ?? []}
                onChange={(v) => {
                  field.onChange(v)
                  clearErrors(field.name)
                }}
                placeholder={certificatesLoading ? 'Loading…' : 'Add certification (e.g. BLS)'}
                disabled={certificatesLoading || isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="stateOfLicensure"
        rules={supervisorFieldRules('stateOfLicensure')}
        render={({ field }) => (
          <FormItem>
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

      <FormField
        control={control}
        name="licenseDoc"
        rules={supervisorFieldRules('licenseDoc')}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <FormItem>
            <FormLabel>
              License or Verification Document <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <UploadFile
                inputRef={ref}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                uploadTitle="Upload license or verification document"
                uploadHint="PDF, JPG, or PNG · Click to browse"
                removeFileAriaLabel="Remove license document"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  )
}
