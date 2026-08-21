'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { LicenseEntriesField } from '@/components/forms/LicenseEntriesField'
import { FormSection } from '@/components/Signup/FormSection'
import {
  type MedicalDirectorFormValues,
  OFFERING_SUPERVISOR_TYPE_NAMES,
  type OfferingKey,
  yearsOfExperienceOptions,
} from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { Switch } from '@/components/ui/switch'
import { UploadFile } from '@/components/ui/upload-file'
import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import {
  isMedicalDirectorType,
  resolveSupervisorTypeCode,
  SUPERVISOR_TYPE_CODES,
} from '@/lib/utils/supervisee-eligibility'
import { getSupervisorCredentialSelectOptions } from '@/lib/utils/supervisor-type'

import { BoardCertificationEntriesField } from './BoardCertificationEntriesField'
import { OfferingCredentialsFields } from './OfferingCredentialsFields'

/** Select does not allow `SelectItem value=""`; map to empty `supervisorSpecialtyId` in the form. */
const SPECIALTY_NONE_VALUE = '__none__'

const yearsOfExperienceSelectOptions: SelectOption[] = yearsOfExperienceOptions.map((v) => ({
  value: v,
  label: v,
}))

type MedicalDirectorStepLicenseCredentialsProps = {
  supervisorTypesData: SupervisorTypeData[]
  stateOptions: SelectOption[]
  supervisorTypesLoading: boolean
  isSubmitting: boolean
}

/**
 * Medical Director variant of the License & Credentials step. The supervisor
 * type is preset (no select rendered) and certifications are omitted —
 * Medical Director is a physician type. Adds the "Offer as Supervising /
 * Collaborating Physician" checkboxes, each revealing its own credentials
 * block.
 */
export function MedicalDirectorStepLicenseCredentials({
  supervisorTypesData,
  stateOptions,
  supervisorTypesLoading,
  isSubmitting,
}: MedicalDirectorStepLicenseCredentialsProps) {
  const { control, clearErrors, setValue, trigger } = useFormContext<MedicalDirectorFormValues>()
  const supervisorOccupationId = useWatch({ control, name: 'supervisorOccupationId' }) ?? ''
  const offerSupervisingPhysician =
    useWatch({ control, name: 'offerSupervisingPhysician' }) ?? false
  const offerCollaboratingPhysician =
    useWatch({ control, name: 'offerCollaboratingPhysician' }) ?? false
  const boardCertified = useWatch({ control, name: 'boardCertified' }) ?? false

  // Resolve hierarchy entries by code so occupation renames never break the lookup.
  const medicalDirectorType = useMemo(
    () => supervisorTypesData.find((t) => isMedicalDirectorType(t)),
    [supervisorTypesData],
  )
  const supervisingType = useMemo(
    () =>
      supervisorTypesData.find(
        (t) => resolveSupervisorTypeCode(t) === SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN,
      ),
    [supervisorTypesData],
  )
  const collaboratingType = useMemo(
    () =>
      supervisorTypesData.find(
        (t) => resolveSupervisorTypeCode(t) === SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN,
      ),
    [supervisorTypesData],
  )

  const occupationOptions = useMemo<SelectOption[]>(
    () => medicalDirectorType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? [],
    [medicalDirectorType],
  )

  const selectedOccupation = useMemo(
    () => medicalDirectorType?.occupations.find((o) => o.name === supervisorOccupationId),
    [medicalDirectorType, supervisorOccupationId],
  )

  const degreeOptions = useMemo<SelectOption[]>(
    () => getSupervisorCredentialSelectOptions(medicalDirectorType, selectedOccupation),
    [medicalDirectorType, selectedOccupation],
  )

  const specialtyOptions = useMemo<SelectOption[]>(
    () => selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? [],
    [selectedOccupation],
  )

  // Physician specialties for board certifications — independent of the chosen
  // occupation (every MD-type occupation carries the same specialty list).
  const boardCertSpecialtyOptions = useMemo<SelectOption[]>(() => {
    const source = medicalDirectorType?.occupations.find(
      (occupation) => occupation.specialties.length > 0,
    )
    return source?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [medicalDirectorType])

  const offeringCheckboxes: Array<{
    key: OfferingKey
    fieldName: 'offerSupervisingPhysician' | 'offerCollaboratingPhysician'
    typeData: SupervisorTypeData | undefined
  }> = [
    { key: 'supervising', fieldName: 'offerSupervisingPhysician', typeData: supervisingType },
    { key: 'collaborating', fieldName: 'offerCollaboratingPhysician', typeData: collaboratingType },
  ]

  const offeringChecked: Record<OfferingKey, boolean> = {
    supervising: offerSupervisingPhysician,
    collaborating: offerCollaboratingPhysician,
  }

  return (
    <FormSection title="License & Credentials">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="supervisorOccupationId"
          label="Occupation"
          rules={supervisorFieldRules('supervisorOccupationId')}
          options={occupationOptions}
          placeholder={supervisorTypesLoading ? 'Loading…' : 'Select Occupation'}
          loading={supervisorTypesLoading}
          disabled={supervisorTypesLoading}
          isSubmitting={isSubmitting}
          required
          onValueChange={() => {
            setValue('supervisorSpecialtyId', '')
            setValue('degreeType', '')
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
          disabled={supervisorTypesLoading || supervisorOccupationId.length === 0}
          isSubmitting={isSubmitting}
          emptySentinel={{ value: SPECIALTY_NONE_VALUE, label: 'None' }}
          selectKey={supervisorOccupationId}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="degreeType"
          label="Degree Type"
          rules={supervisorFieldRules('degreeType')}
          options={degreeOptions}
          placeholder="Select Degree Type"
          loading={supervisorTypesLoading}
          disabled={supervisorTypesLoading}
          selectKey={supervisorOccupationId}
          isSubmitting={isSubmitting}
          required
        />
      </div>

      {/* Medical Director is a physician type — the per-entry license-type select stays hidden. */}
      <LicenseEntriesField
        licenseTypeOptions={[]}
        stateOptions={stateOptions}
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

      {/* ── Board certification — optional; Yes reveals the entry cards ── */}
      <div className="space-y-4 border-t border-border pt-6">
        <FormField
          control={control}
          name="boardCertified"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board Certified?</FormLabel>
              <FormControl>
                <div className="flex h-10 items-center justify-between rounded-lg border border-input bg-card px-3">
                  <span className="text-sm text-muted-foreground">
                    {field.value ? 'Yes' : 'No'}
                  </span>
                  <Switch
                    checked={field.value ?? false}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      // Values persist (shouldUnregister: false) but stale entry
                      // errors must not linger once the cards are hidden.
                      if (!checked) clearErrors('boardCertifications')
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {boardCertified ? (
          <BoardCertificationEntriesField
            specialtyOptions={boardCertSpecialtyOptions}
            specialtiesLoading={supervisorTypesLoading}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>

      {/* ── Secondary offerings — each checked box reveals its own credentials block ── */}
      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <p className="text-base font-semibold">Additional Physician Offerings</p>
          <p className="text-sm text-muted-foreground">
            Also offer your services as a Supervising and/or Collaborating Physician. Each offering
            requires its own credentials.
          </p>
        </div>

        {offeringCheckboxes.map(({ key, fieldName, typeData }) => (
          <div key={key} className="space-y-4">
            <FormField
              control={control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        disabled={isSubmitting}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true)
                          // Values persist (shouldUnregister: false) but stale block
                          // errors must not linger once the block is hidden.
                          if (checked !== true) clearErrors(`offerings.${key}`)
                        }}
                        className="mt-0.5 shrink-0"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        Offer as {OFFERING_SUPERVISOR_TYPE_NAMES[key]}
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {offeringChecked[key] ? (
              <OfferingCredentialsFields
                offeringKey={key}
                title={`${OFFERING_SUPERVISOR_TYPE_NAMES[key]} Credentials`}
                typeData={typeData}
                stateOptions={stateOptions}
                supervisorTypesLoading={supervisorTypesLoading}
                isSubmitting={isSubmitting}
              />
            ) : null}
          </div>
        ))}
      </div>
    </FormSection>
  )
}
