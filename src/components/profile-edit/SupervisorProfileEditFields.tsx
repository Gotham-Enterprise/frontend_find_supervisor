'use client'

import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { yearsOfExperienceOptions } from '@/components/Signup/schema'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { ProfilePhotoUpload } from '@/components/ui/profile-photo-upload'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption } from '@/lib/api/options'
import {
  type EditSupervisorProfileFormValues,
  SUPERVISOR_PROFILE_FEE_TYPE_OPTIONS,
  SUPERVISOR_PROFILE_FORMAT_OPTIONS,
} from '@/lib/forms/supervisor-profile-edit'
import {
  useAvailabilityOptions,
  useCertificateOptions,
  useCitiesOptions,
  useLicenseTypeOptions,
  useOccupationOptions,
  usePatientPopulationOptions,
  useSpecialtiesByOccupation,
  useStatesOptions,
  useSupervisorTypeOptions,
} from '@/lib/hooks'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

const yearsOfExperienceSelectOptions: SelectOption[] = yearsOfExperienceOptions.map((v) => ({
  value: v,
  label: v,
}))

export interface SupervisorProfileEditFieldsProps {
  form: UseFormReturn<EditSupervisorProfileFormValues>
  profile: SupervisorProfileData
  isSubmitting: boolean
  /** Changes when the parent syncs the form (e.g. `form.reset`) so city is not cleared on full-form sync. */
  locationSyncEpoch?: string | number
}

export function SupervisorProfileEditFields({
  form,
  profile,
  isSubmitting,
  locationSyncEpoch = '',
}: SupervisorProfileEditFieldsProps) {
  const {
    data: stateOptions = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useStatesOptions()
  const stateWatch = useWatch({ control: form.control, name: 'state' }) ?? ''
  const stateForCities = stateWatch.trim()
  const {
    data: cityOptions = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = useCitiesOptions(stateForCities)

  const prevStateForCityReset = useRef<string | undefined>(undefined)
  const isInitialStateForCity = useRef(true)

  useEffect(() => {
    const current = (form.getValues('state') ?? '').trim()
    prevStateForCityReset.current = current
    isInitialStateForCity.current = true
  }, [locationSyncEpoch, form])

  useEffect(() => {
    const current = stateWatch.trim()
    if (isInitialStateForCity.current) {
      isInitialStateForCity.current = false
      prevStateForCityReset.current = current
      return
    }
    if (prevStateForCityReset.current !== current) {
      form.setValue('city', '')
    }
    prevStateForCityReset.current = current
  }, [stateWatch, form])

  const { data: licenseTypeOptions = [] } = useLicenseTypeOptions()
  const { data: supervisorTypeOptions = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypeOptions()
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  const { data: certificationOptions = [] } = useCertificateOptions()
  const { data: patientPopulationOptions = [] } = usePatientPopulationOptions()
  const { data: occupationOptions = [] } = useOccupationOptions()

  const selectedOccupationId = useWatch({ control: form.control, name: 'occupationId' }) ?? ''
  const { data: specialtyOptions = [] } = useSpecialtiesByOccupation(selectedOccupationId)

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <FormField
          control={form.control}
          name="uploadProfilePhoto"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-1">
              <FormLabel>
                Profile Photo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <ProfilePhotoUpload
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  size="lg"
                  existingPhotoUrl={profile.user.profilePhotoUrl}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputField
            control={form.control}
            name="fullName"
            label="Full Name"
            required
            placeholder="Enter Full Name"
            autoCapitalizePersonName
            isSubmitting={isSubmitting}
          />
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contact Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormSelectField
            control={form.control}
            name="city"
            label="City"
            required
            options={cityOptions}
            placeholder={
              !stateWatch.trim()
                ? 'Select a state first'
                : citiesLoading
                  ? 'Loading…'
                  : 'Select city'
            }
            disabled={!stateWatch.trim() || citiesLoading}
            selectKey={stateForCities || 'no-state'}
            sortOptions
            isSubmitting={isSubmitting}
            emptyState={
              stateWatch.trim() && cityOptions.length === 0 && !citiesLoading && !citiesError
                ? {
                    when: true,
                    children: (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No cities available for this state.
                      </p>
                    ),
                  }
                : undefined
            }
          />
          <FormSelectField
            control={form.control}
            name="state"
            label="State"
            required
            options={stateOptions}
            placeholder="Select State"
            loading={statesLoading}
            isSubmitting={isSubmitting}
            sortOptions
            emptyState={
              stateOptions.length === 0 && !statesLoading && !statesError
                ? {
                    when: true,
                    children: (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No states available.
                      </p>
                    ),
                  }
                : undefined
            }
          />
          <FormInputField
            control={form.control}
            name="zipcode"
            label="Zipcode"
            required
            placeholder="10001"
            isSubmitting={isSubmitting}
          />
        </div>
        <FormInputField
          control={form.control}
          name="website"
          label="Website"
          placeholder="https://example.com"
          normalizeEmptyToString
          isSubmitting={isSubmitting}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Occupation
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="occupationId"
            label="Occupation"
            required
            options={occupationOptions ?? []}
            placeholder="Select Occupation"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormSelectField
            control={form.control}
            name="specialtyId"
            label="Specialty"
            options={specialtyOptions}
            placeholder="Select Specialty"
            isSubmitting={isSubmitting}
            disabled={!selectedOccupationId}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          License &amp; Credentials
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="licenseType"
            label="License Type"
            required
            options={licenseTypeOptions}
            placeholder="Select License Type"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormInputField
            control={form.control}
            name="licenseNumber"
            label="License Number"
            required
            placeholder="Enter License Number"
            isSubmitting={isSubmitting}
          />
        </div>
        <FormSelectField
          control={form.control}
          name="supervisorType"
          label="Supervisor Type"
          required
          options={supervisorTypeOptions}
          placeholder="Select supervisor type"
          loading={supervisorTypesLoading}
          sortOptions
          isSubmitting={isSubmitting}
          emptySentinel={{ value: '__none__', label: 'None' }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputField
            control={form.control}
            name="licenseExpiration"
            label="License Expiration"
            required
            type="date"
            isSubmitting={isSubmitting}
          />
          <FormSelectField
            control={form.control}
            name="yearsOfExperience"
            label="Years of Experience"
            required
            options={yearsOfExperienceSelectOptions}
            placeholder="Select Years of Experience"
            isSubmitting={isSubmitting}
          />
        </div>
        <FormInputField
          control={form.control}
          name="npiNumber"
          label="NPI Number"
          placeholder="Enter your NPI Number"
          isSubmitting={isSubmitting}
        />
        <FormField
          control={form.control}
          name="stateOfLicensure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                States of Licensure <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={stateOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select States..."
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Certifications <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={certificationOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select Certifications..."
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Practice Details
        </legend>
        <FormField
          control={form.control}
          name="patientPopulation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Patient Population <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TagInput
                  options={patientPopulationOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select Patient Populations..."
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="supervisionFormat"
            label="Supervision Format"
            required
            options={SUPERVISOR_PROFILE_FORMAT_OPTIONS}
            placeholder="Select Format"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormSelectField
            control={form.control}
            name="availability"
            label="Availability"
            required
            options={availabilityOptions}
            placeholder="Select Availability"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="supervisionFeeType"
            label="Fee Type"
            required
            options={SUPERVISOR_PROFILE_FEE_TYPE_OPTIONS}
            placeholder="Select Fee Type"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormInputField
            control={form.control}
            name="supervisionFeeAmount"
            label="Fee Amount ($)"
            required
            type="number"
            numberValue
            min={0}
            placeholder="Enter Fee Amount"
            isSubmitting={isSubmitting}
          />
        </div>
        <FormField
          control={form.control}
          name="acceptingSupervisees"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel className="text-sm font-medium">Accepting Supervisees</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Toggle to indicate if you are currently accepting new supervisees
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          About You
        </legend>
        <FormField
          control={form.control}
          name="professionalSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Professional Summary <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Enter your Professional Summary"
                  rows={3}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="describeYourself"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Describe Yourself <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Please describe yourself..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>
    </div>
  )
}
