'use client'

import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { ProfilePhotoUpload } from '@/components/ui/profile-photo-upload'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/lib/hooks'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

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
            placeholder="Jane Smith"
            autoCapitalizePersonName
            isSubmitting={isSubmitting}
          />
          <FormInputField
            control={form.control}
            name="contactNumber"
            label="Contact Number"
            required
            placeholder="+1 (555) 000-0000"
            isSubmitting={isSubmitting}
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
            placeholder="Select state"
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
            placeholder="Select occupation"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormSelectField
            control={form.control}
            name="specialtyId"
            label="Specialty"
            options={specialtyOptions}
            placeholder="Select specialty"
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
            placeholder="Select license type"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormInputField
            control={form.control}
            name="licenseNumber"
            label="License Number"
            required
            placeholder="LIC-12345"
            isSubmitting={isSubmitting}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputField
            control={form.control}
            name="licenseExpiration"
            label="License Expiration"
            required
            type="date"
            isSubmitting={isSubmitting}
          />
          <FormInputField
            control={form.control}
            name="yearsOfExperience"
            label="Years of Experience"
            required
            placeholder="e.g. 5 – 10 years"
            isSubmitting={isSubmitting}
          />
        </div>
        <FormInputField
          control={form.control}
          name="npiNumber"
          label="NPI Number"
          placeholder="1234567890"
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
                  placeholder="Select states..."
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
                  placeholder="Select certifications..."
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
                  placeholder="Select patient populations..."
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
            placeholder="Select format"
            isSubmitting={isSubmitting}
            emptySentinel={{ value: '__none__', label: 'None' }}
          />
          <FormSelectField
            control={form.control}
            name="availability"
            label="Availability"
            required
            options={availabilityOptions}
            placeholder="Select availability"
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
            placeholder="Select fee type"
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
            placeholder="100"
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
                  placeholder="Describe your supervision style, background, and approach..."
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
                  placeholder="Share more about yourself and what makes you a great supervisor..."
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
