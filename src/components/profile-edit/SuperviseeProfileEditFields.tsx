'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { ProfilePhotoUpload } from '@/components/ui/profile-photo-upload'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption } from '@/lib/api/options'
import {
  type EditSuperviseeProfileFormValues,
  SUPERVISEE_CREDENTIAL_TITLE_LABEL,
  SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER,
  SUPERVISEE_PROFILE_BUDGET_TYPE_OPTIONS,
  SUPERVISEE_PROFILE_FORMAT_OPTIONS,
} from '@/lib/forms/supervisee-profile-edit'
import {
  useCitiesOptions,
  useSpecialtiesByOccupation,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSupervisorTypesData,
} from '@/lib/hooks'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

export interface SuperviseeProfileEditFieldsProps {
  form: UseFormReturn<EditSuperviseeProfileFormValues>
  profile: SuperviseeProfileData
  isSubmitting: boolean
  /** Changes when the parent syncs the form (e.g. `form.reset`) so city is not cleared on full-form sync. */
  locationSyncEpoch?: string | number
}

export function SuperviseeProfileEditFields({
  form,
  profile,
  isSubmitting,
  locationSyncEpoch = '',
}: SuperviseeProfileEditFieldsProps) {
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

  const { availability, howSoon, occupations } = useSuperviseeFormOptions()
  const availabilityOptions = availability.data ?? []
  const howSoonOptions = howSoon.data ?? []
  const occupationOptions = occupations.data ?? []

  const { data: supervisorTypesData = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypesData()

  const selectedOccupationId = useWatch({ control: form.control, name: 'occupationId' }) ?? ''
  const typeOfSupervisorNeeded =
    useWatch({ control: form.control, name: 'typeOfSupervisorNeeded' }) ?? ''
  const superviseeOccupation =
    useWatch({ control: form.control, name: 'superviseeOccupation' }) ?? ''
  const howSoonLooking = useWatch({ control: form.control, name: 'howSoonLooking' })
  const { data: specialtyOptions = [] } = useSpecialtiesByOccupation(selectedOccupationId)

  const supervisorTypeOptions = useMemo<SelectOption[]>(
    () => supervisorTypesData.map((t) => ({ label: t.name, value: t.name })),
    [supervisorTypesData],
  )

  const supervisionOccupationOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisorNeeded) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisorNeeded)
    return selectedType?.occupations.map((o) => ({ label: o.name, value: o.name })) ?? []
  }, [typeOfSupervisorNeeded, supervisorTypesData])

  const supervisionSpecialtyOptions = useMemo<SelectOption[]>(() => {
    if (!typeOfSupervisorNeeded || !superviseeOccupation) return []
    const selectedType = supervisorTypesData.find((t) => t.name === typeOfSupervisorNeeded)
    const selectedOccupation = selectedType?.occupations.find(
      (o) => o.name === superviseeOccupation,
    )
    return selectedOccupation?.specialties.map((s) => ({ label: s.name, value: s.name })) ?? []
  }, [typeOfSupervisorNeeded, superviseeOccupation, supervisorTypesData])

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <FormField
          control={form.control}
          name="uploadProfilePhoto"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-1">
              <FormLabel>Profile Photo</FormLabel>
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
            placeholder="10001"
            isSubmitting={isSubmitting}
            required
          />
        </div>
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
            options={occupationOptions ?? []}
            placeholder="Select Occupation"
            isSubmitting={isSubmitting}
            required
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
        <FormInputField
          control={form.control}
          name="title"
          label={SUPERVISEE_CREDENTIAL_TITLE_LABEL}
          placeholder={SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER}
          isSubmitting={isSubmitting}
          required
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Supervision Needs
        </legend>

        <FormSelectField
          control={form.control}
          name="typeOfSupervisorNeeded"
          label="Type of Supervision Needed"
          options={supervisorTypeOptions}
          placeholder={supervisorTypesLoading ? 'Loading…' : 'Select type of supervision'}
          loading={supervisorTypesLoading}
          isSubmitting={isSubmitting}
          required
          onValueChange={() => {
            form.setValue('superviseeOccupation', '')
            form.setValue('superviseeSpecialty', '')
            form.clearErrors(['superviseeOccupation', 'superviseeSpecialty'])
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="superviseeOccupation"
            label="Occupation"
            options={supervisionOccupationOptions}
            placeholder={
              !typeOfSupervisorNeeded
                ? 'Select a type of supervision first'
                : supervisionOccupationOptions.length === 0
                  ? 'No occupations available'
                  : 'Select occupation'
            }
            loading={supervisorTypesLoading}
            isSubmitting={isSubmitting || !typeOfSupervisorNeeded}
            selectKey={typeOfSupervisorNeeded}
            required
            onValueChange={() => {
              form.setValue('superviseeSpecialty', '')
              form.clearErrors('superviseeSpecialty')
            }}
          />

          <FormSelectField
            control={form.control}
            name="superviseeSpecialty"
            label="Specialty"
            options={supervisionSpecialtyOptions}
            placeholder={
              !superviseeOccupation
                ? 'Select an occupation first'
                : supervisionSpecialtyOptions.length === 0
                  ? 'No specialties available'
                  : 'Select specialty'
            }
            loading={supervisorTypesLoading}
            isSubmitting={isSubmitting || !superviseeOccupation}
            selectKey={`${typeOfSupervisorNeeded}-${superviseeOccupation}`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          <FormField
            control={form.control}
            name="stateTheyAreLookingIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  State(s) You Are Looking In <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <TagInput
                    options={stateOptions}
                    value={field.value ?? []}
                    onChange={(v) => {
                      field.onChange(v)
                      form.clearErrors(field.name)
                    }}
                    placeholder={statesLoading ? 'Loading…' : 'Add a state (e.g. CA)'}
                    disabled={isSubmitting || statesLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="howSoonLooking"
            label="How Soon Looking"
            options={howSoonOptions}
            placeholder="Select Timeline"
            isSubmitting={isSubmitting}
            required
          />
          {howSoonLooking === 'CUSTOM_DATE' && (
            <FormInputField
              control={form.control}
              name="lookingDate"
              label="Looking Date"
              type="date"
              isSubmitting={isSubmitting}
              required
            />
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelectField
            control={form.control}
            name="preferredFormat"
            label="Preferred Format"
            options={SUPERVISEE_PROFILE_FORMAT_OPTIONS}
            placeholder="Select Format"
            isSubmitting={isSubmitting}
            required
          />
          <FormSelectField
            control={form.control}
            name="availability"
            label="Availability"
            options={availabilityOptions}
            placeholder="Select Availability"
            isSubmitting={isSubmitting}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Budget
        </legend>
        <FormSelectField
          control={form.control}
          name="budgetRangeType"
          label="Budget Type"
          options={SUPERVISEE_PROFILE_BUDGET_TYPE_OPTIONS}
          placeholder="Select Budget Type"
          isSubmitting={isSubmitting}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputField
            control={form.control}
            name="budgetRangeStart"
            label="Budget Min ($)"
            type="number"
            numberValue
            min={0}
            placeholder="0"
            isSubmitting={isSubmitting}
          />
          <FormInputField
            control={form.control}
            name="budgetRangeEnd"
            label="Budget Max ($)"
            type="number"
            numberValue
            min={0}
            placeholder="200"
            isSubmitting={isSubmitting}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          About
        </legend>
        <FormField
          control={form.control}
          name="idealSupervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ideal Supervisor / About Me <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Please describe what you are looking for in a supervisor and a bit about yourself..."
                  rows={4}
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
