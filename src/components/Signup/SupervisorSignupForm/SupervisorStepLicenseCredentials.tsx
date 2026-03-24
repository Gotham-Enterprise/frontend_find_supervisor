'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SupervisorFormValues, yearsOfExperienceOptions } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/ui/tag-input'
import { UploadFile } from '@/components/ui/upload-file'
import type { SelectOption } from '@/lib/api/options'

/** Radix Select does not allow `SelectItem value=""`; map to empty `specialtyId` in the form. */
const SPECIALTY_NONE_VALUE = '__none__'

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
}: SupervisorStepLicenseCredentialsProps) {
  const { control, clearErrors } = useFormContext<SupervisorFormValues>()
  const occupationId = useWatch({ control, name: 'occupationId' }) ?? ''
  const specialtyDisabled = occupationsLoading || specialtiesLoading || occupationId.length === 0

  return (
    <FormSection title="License & Credentials">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="occupationId"
          rules={supervisorFieldRules('occupationId')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Occupation <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={occupationsLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return occupationOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue
                      placeholder={occupationsLoading ? 'Loading…' : 'Select occupation'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {occupationOptions.map((opt) => (
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
          name="specialtyId"
          rules={supervisorFieldRules('specialtyId')}
          render={({ field }) => {
            const selectValue = field.value ? field.value : SPECIALTY_NONE_VALUE
            return (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <Select
                  value={selectValue}
                  onValueChange={(v) => {
                    field.onChange(v === SPECIALTY_NONE_VALUE ? '' : (v ?? ''))
                    field.onBlur()
                  }}
                  disabled={specialtyDisabled}
                  itemToStringLabel={(val) => {
                    if (val == null || val === '' || val === SPECIALTY_NONE_VALUE) return 'None'
                    return specialtyOptions.find((o) => o.value === val)?.label ?? String(val)
                  }}
                >
                  <FormControl>
                    <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                      <SelectValue
                        placeholder={
                          specialtiesLoading ? 'Loading…' : 'Select specialty (optional)'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SPECIALTY_NONE_VALUE}>None</SelectItem>
                    {specialtyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="licenseType"
          rules={supervisorFieldRules('licenseType')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                License Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={licenseTypesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return licenseTypeOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue
                      placeholder={licenseTypesLoading ? 'Loading…' : 'Select license type'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {licenseTypeOptions.map((opt) => (
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
          name="licenseNumber"
          rules={supervisorFieldRules('licenseNumber')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                License Number <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="License number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="licenseExpiration"
          rules={supervisorFieldRules('licenseExpiration')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                License Expiration <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="npiNumber"
          rules={supervisorFieldRules('npiNumber')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>NPI Number</FormLabel>
              <FormControl>
                <Input placeholder="Optional" maxLength={20} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="yearsOfExperience"
        rules={supervisorFieldRules('yearsOfExperience')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Years of Experience <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              value={field.value ?? ''}
              onValueChange={(v) => {
                field.onChange(v ?? '')
                field.onBlur()
              }}
              itemToStringLabel={(val) => (val == null || val === '' ? '' : String(val))}
            >
              <FormControl>
                <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                  <SelectValue placeholder="Select years of experience" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {yearsOfExperienceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
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
        name="certifications"
        rules={supervisorFieldRules('certifications')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Certifications <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <TagInput
                options={certificateOptions}
                value={field.value ?? []}
                onChange={(v) => {
                  field.onChange(v)
                  clearErrors(field.name)
                }}
                placeholder={certificatesLoading ? 'Loading…' : 'Add certification (e.g. BLS)'}
                disabled={certificatesLoading}
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  )
}
