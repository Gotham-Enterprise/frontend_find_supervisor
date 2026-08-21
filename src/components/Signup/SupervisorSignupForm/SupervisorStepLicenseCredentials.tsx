'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { LicenseEntriesField } from '@/components/forms/LicenseEntriesField'
import { FormSection } from '@/components/Signup/FormSection'
import { type SupervisorFormValues, yearsOfExperienceOptions } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import { UploadFile } from '@/components/ui/upload-file'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import {
  getSupervisorCredentialSelectOptions,
  isPhysicianSupervisorType,
  PHYSICIAN_CERTIFICATIONS_DISABLED_MESSAGE,
} from '@/lib/utils/supervisor-type'

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
  const { control, clearErrors, setValue, getValues, trigger } =
    useFormContext<SupervisorFormValues>()
  const supervisorType = useWatch({ control, name: 'supervisorType' }) ?? ''
  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' }) ?? ''
  const physicianSupervisorType = isPhysicianSupervisorType(supervisorType)
  const certificationsDisabled = physicianSupervisorType || certificatesLoading || isSubmitting

  /** Options change with supervisor type/occupation, so per-entry license types reset. */
  const resetLicenseEntryTypes = () => {
    const licenses = getValues('licenses') ?? []
    setValue(
      'licenses',
      licenses.map((license) => ({ ...license, licenseType: '' })),
    )
  }

  // Derive occupation options directly from the hierarchy for the selected supervisor type.
  const occupationOptions = useMemo<SelectOption[]>(() => {
    if (!supervisorType) return []
    const selectedType = supervisorTypesData.find((t) => t.name === supervisorType)
    return selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []
  }, [supervisorType, supervisorTypesData])

  const credentialOptions = useMemo<SelectOption[]>(() => {
    const selectedType = supervisorTypesData.find((t) => t.name === supervisorType)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === supervisorOccupationId,
    )
    return getSupervisorCredentialSelectOptions(selectedType, selectedOccupation)
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
        placeholder={supervisorTypesLoading ? 'Loading…' : 'Select Supervisor Type'}
        loading={supervisorTypesLoading}
        isSubmitting={isSubmitting}
        required
        onValueChange={() => {
          setValue('supervisorOccupationId', '')
          setValue('supervisorSpecialtyId', '')
          setValue('degreeType', '')
          setValue('certifications', [])
          resetLicenseEntryTypes()
          clearErrors([
            'supervisorOccupationId',
            'supervisorSpecialtyId',
            'degreeType',
            'certifications',
            'licenses',
          ])
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="supervisorOccupationId"
          label="Occupation"
          rules={supervisorFieldRules('supervisorOccupationId')}
          options={occupationOptions}
          placeholder={occupationDisabled ? 'Select a Supervisor Type First' : 'Select Occupation'}
          loading={supervisorTypesLoading}
          disabled={occupationDisabled}
          isSubmitting={isSubmitting}
          selectKey={supervisorType}
          required
          onValueChange={() => {
            setValue('supervisorSpecialtyId', '')
            setValue('degreeType', '')
            resetLicenseEntryTypes()
            clearErrors(['supervisorSpecialtyId', 'degreeType', 'licenses'])
          }}
        />
        <FormSelectField
          control={control}
          name="supervisorSpecialtyId"
          label="Specialty"
          options={specialtyOptions}
          sortOptions
          placeholder="Select Specialty (optional)"
          loading={supervisorTypesLoading}
          disabled={specialtyDisabled}
          isSubmitting={isSubmitting}
          emptySentinel={{ value: SPECIALTY_NONE_VALUE, label: 'None' }}
          selectKey={`${supervisorType}-${supervisorOccupationId}`}
        />
      </div>

      {physicianSupervisorType ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelectField
            control={control}
            name="degreeType"
            label="Degree Type"
            rules={supervisorFieldRules('degreeType')}
            options={credentialOptions}
            placeholder="Select Degree Type"
            loading={supervisorTypesLoading}
            disabled={supervisorTypesLoading}
            selectKey={supervisorOccupationId}
            isSubmitting={isSubmitting}
            required
          />
        </div>
      ) : null}

      <LicenseEntriesField
        licenseTypeOptions={credentialOptions}
        stateOptions={stateOptions}
        licenseTypesLoading={supervisorTypesLoading}
        licenseTypeDisabled={licenseTypeDisabled}
        licenseTypePlaceholder={
          licenseTypeDisabled ? 'Select an Occupation First' : 'Select License Type'
        }
        licenseTypeSelectKey={supervisorOccupationId}
        isSubmitting={isSubmitting}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputField
          control={control}
          name="npiNumber"
          label="NPI Number"
          rules={supervisorFieldRules('npiNumber')}
          placeholder="Enter Your NPI Number"
          maxLength={20}
          isSubmitting={isSubmitting}
        />
        <FormSelectField
          control={control}
          name="yearsOfExperience"
          label="Years of Experience"
          rules={supervisorFieldRules('yearsOfExperience')}
          options={yearsOfExperienceSelectOptions}
          placeholder="Select Years of Experience"
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <FormField
        control={control}
        name="certifications"
        rules={supervisorFieldRules('certifications')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Certifications
              {!physicianSupervisorType ? <span className="text-destructive"> *</span> : null}
            </FormLabel>
            <FormControl>
              <div
                title={
                  physicianSupervisorType ? PHYSICIAN_CERTIFICATIONS_DISABLED_MESSAGE : undefined
                }
              >
                <TagInput
                  options={certificateOptions.sort((a, b) => a.label.localeCompare(b.label))}
                  value={field.value ?? []}
                  onChange={(v) => {
                    field.onChange(v)
                    clearErrors(field.name)
                  }}
                  placeholder={
                    physicianSupervisorType
                      ? 'Not applicable for this supervisor type'
                      : certificatesLoading
                        ? 'Loading…'
                        : 'Add Certification (e.g. BLS)'
                  }
                  disabled={certificationsDisabled}
                />
              </div>
            </FormControl>
            {physicianSupervisorType ? (
              <p className="text-xs text-muted-foreground">
                {PHYSICIAN_CERTIFICATIONS_DISABLED_MESSAGE}
              </p>
            ) : null}
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
                onChange={(file) => {
                  onChange(file)
                  // The hidden file input is never "touched" (mode: 'onTouched'), so RHF skips
                  // re-validation on change and stale manual setError messages stick after
                  // delete/re-upload. Force validation so the error always matches the value.
                  void trigger('licenseDoc')
                }}
                onBlur={onBlur}
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                uploadTitle="Upload license or verification document"
                uploadHint="PDF, JPG, or PNG (max 5 MB) · Click to browse"
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
