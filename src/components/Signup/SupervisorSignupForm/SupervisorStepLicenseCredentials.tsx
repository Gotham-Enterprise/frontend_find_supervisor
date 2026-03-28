'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SupervisorFormValues, yearsOfExperienceOptions } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import { UploadFile } from '@/components/ui/upload-file'
import type { SelectOption } from '@/lib/api/options'

/** Select does not allow `SelectItem value=""`; map to empty `specialtyId` in the form. */
const SPECIALTY_NONE_VALUE = '__none__'

const yearsOfExperienceSelectOptions: SelectOption[] = yearsOfExperienceOptions.map((v) => ({
  value: v,
  label: v,
}))

type SupervisorStepLicenseCredentialsProps = {
  occupationOptions: SelectOption[]
  specialtyOptions: SelectOption[]
  licenseTypeOptions: SelectOption[]
  certificateOptions: SelectOption[]
  stateOptions: SelectOption[]
  occupationsLoading: boolean
  specialtiesLoading: boolean
  licenseTypesLoading: boolean
  certificatesLoading: boolean
  isSubmitting: boolean
}

export function SupervisorStepLicenseCredentials({
  occupationOptions,
  specialtyOptions,
  licenseTypeOptions,
  certificateOptions,
  stateOptions,
  occupationsLoading,
  specialtiesLoading,
  licenseTypesLoading,
  certificatesLoading,
  isSubmitting,
}: SupervisorStepLicenseCredentialsProps) {
  const { control, clearErrors } = useFormContext<SupervisorFormValues>()
  const occupationId = useWatch({ control, name: 'occupationId' }) ?? ''
  const specialtyDisabled = occupationsLoading || specialtiesLoading || occupationId.length === 0

  return (
    <FormSection title="License & Credentials">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="occupationId"
          label="Occupation"
          rules={supervisorFieldRules('occupationId')}
          options={occupationOptions}
          placeholder="Select occupation"
          loading={occupationsLoading}
          isSubmitting={isSubmitting}
          required
        />
        <FormSelectField
          control={control}
          name="specialtyId"
          label="Specialty"
          rules={supervisorFieldRules('specialtyId')}
          options={specialtyOptions}
          placeholder="Select specialty (optional)"
          loading={specialtiesLoading}
          disabled={specialtyDisabled}
          isSubmitting={isSubmitting}
          emptySentinel={{ value: SPECIALTY_NONE_VALUE, label: 'None' }}
          sortOptions
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="licenseType"
          label="License Type"
          rules={supervisorFieldRules('licenseType')}
          options={licenseTypeOptions}
          placeholder="Select license type"
          loading={licenseTypesLoading}
          sortOptions
          isSubmitting={isSubmitting}
          required
        />
        <FormInputField
          control={control}
          name="licenseNumber"
          label="License Number"
          rules={supervisorFieldRules('licenseNumber')}
          placeholder="License number"
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
          placeholder="Optional"
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
