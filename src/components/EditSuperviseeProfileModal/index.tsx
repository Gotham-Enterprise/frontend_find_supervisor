'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { ProfilePhotoUpload } from '@/components/ui/profile-photo-upload'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/lib/contexts/UserContext'
import {
  useAvailabilityOptions,
  useHowSoonOptions,
  useOccupationOptions,
  useSpecialtiesByOccupation,
  useStatesOptions,
  useSupervisorTypeOptions,
} from '@/lib/hooks'
import { useUpdateSuperviseeProfile } from '@/lib/hooks/useUpdateSuperviseeProfile'
import { normalizeUSPhoneNumber } from '@/lib/utils/phone'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
] as const

const BUDGET_TYPE_OPTIONS = [
  { label: 'Per Session', value: 'PER_SESSION' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

// ─── Schema ───────────────────────────────────────────────────────────────────

const editSuperviseeSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required').max(100),
    contactNumber: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipcode: z
      .string()
      .max(10)
      .optional()
      .refine((v) => !v || /^\d{5}(-\d{4})?$/.test(v), 'Enter a valid US zipcode'),
    occupationId: z.string().optional(),
    specialtyId: z.string().optional(),
    stateOfLicensure: z.array(z.string()).optional(),
    typeOfSupervisorNeeded: z.string().optional(),
    howSoonLooking: z.string().optional(),
    lookingDate: z.string().optional(),
    preferredFormat: z.string().optional(),
    availability: z.string().optional(),
    idealSupervisor: z.string().max(500).optional(),
    stateTheyAreLookingIn: z.string().optional(),
    budgetRangeType: z.string().optional(),
    budgetRangeStart: z.number().min(0).optional(),
    budgetRangeEnd: z.number().min(0).optional(),
    uploadProfilePhoto: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.howSoonLooking === 'CUSTOM_DATE' && !data.lookingDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['lookingDate'],
        message: 'Please select a date',
      })
    }
  })

type EditSuperviseeFormValues = z.infer<typeof editSuperviseeSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditSuperviseeProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: SuperviseeProfileData
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditSuperviseeProfileModal({
  open,
  onOpenChange,
  profile,
}: EditSuperviseeProfileModalProps) {
  const { user } = useUser()
  const userId = user?.id ?? ''

  const mutation = useUpdateSuperviseeProfile(userId)

  const { data: stateOptions = [] } = useStatesOptions()
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  const { data: howSoonOptions = [] } = useHowSoonOptions()
  const { data: supervisorTypeOptions = [] } = useSupervisorTypeOptions()
  const { data: occupationOptions = [] } = useOccupationOptions()

  const defaultOccupationId = String(
    profile.occupationId ?? profile.occupation?.id ?? profile.user.occupation?.id ?? '',
  )
  const defaultSpecialtyId = String(
    profile.specialtyId ?? profile.specialty?.id ?? profile.user.specialty?.id ?? '',
  )

  const defaultValues: EditSuperviseeFormValues = {
    fullName: profile.user.fullName ?? '',
    contactNumber: profile.user.contactNumber ?? '',
    city: profile.user.city ?? '',
    state: profile.user.state ?? '',
    zipcode: profile.user.zipcode ?? '',
    occupationId: defaultOccupationId,
    specialtyId: defaultSpecialtyId,
    stateOfLicensure: profile.user.stateOfLicensure ?? [],
    typeOfSupervisorNeeded: profile.typeOfSupervisorNeeded ?? '',
    howSoonLooking: profile.howSoonLooking ?? '',
    lookingDate: profile.lookingDate ? profile.lookingDate.slice(0, 10) : '',
    preferredFormat: profile.preferredFormat ?? '',
    availability: profile.availability ?? '',
    idealSupervisor: profile.idealSupervisor ?? '',
    stateTheyAreLookingIn: profile.stateTheyAreLookingIn ?? '',
    budgetRangeType: profile.budgetRangeType ?? '',
    budgetRangeStart: profile.budgetRangeStart ?? undefined,
    budgetRangeEnd: profile.budgetRangeEnd ?? undefined,
    uploadProfilePhoto: undefined,
  }

  const form = useForm<EditSuperviseeFormValues>({
    resolver: zodResolver(editSuperviseeSchema),
    defaultValues,
  })

  const selectedOccupationId = useWatch({ control: form.control, name: 'occupationId' }) ?? ''
  const howSoonLooking = useWatch({ control: form.control, name: 'howSoonLooking' })
  const { data: specialtyOptions = [] } = useSpecialtiesByOccupation(selectedOccupationId)

  // Reset form when modal opens with fresh profile data
  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: EditSuperviseeFormValues) {
    await mutation.mutateAsync({
      fullName: values.fullName,
      contactNumber: values.contactNumber
        ? (normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
        : undefined,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode || undefined,
      occupation: values.occupationId || undefined,
      specialty: values.specialtyId || undefined,
      stateOfLicensure: values.stateOfLicensure,
      typeOfSupervisorNeeded: values.typeOfSupervisorNeeded || undefined,
      howSoonLooking: values.howSoonLooking || undefined,
      lookingDate:
        values.howSoonLooking === 'CUSTOM_DATE' ? values.lookingDate || undefined : undefined,
      preferredFormat: values.preferredFormat || undefined,
      availability: values.availability || undefined,
      idealSupervisor: values.idealSupervisor || undefined,
      stateTheyAreLookingIn: values.stateTheyAreLookingIn || undefined,
      budgetRangeType: values.budgetRangeType || undefined,
      budgetRangeStart: values.budgetRangeStart,
      budgetRangeEnd: values.budgetRangeEnd,
      uploadProfilePhoto:
        values.uploadProfilePhoto instanceof File ? values.uploadProfilePhoto : undefined,
    })
    onOpenChange(false)
  }

  const isSubmitting = form.formState.isSubmitting || mutation.isPending

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="mb-4">Edit Supervisee Profile</DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo */}
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

            {/* Personal Info */}
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
                  isSubmitting={isSubmitting}
                />
                <FormInputField
                  control={form.control}
                  name="contactNumber"
                  label="Contact Number"
                  placeholder="+1 (555) 000-0000"
                  isSubmitting={isSubmitting}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormInputField
                  control={form.control}
                  name="city"
                  label="City"
                  required
                  placeholder="New York"
                  isSubmitting={isSubmitting}
                />
                <FormSelectField
                  control={form.control}
                  name="state"
                  label="State"
                  required
                  options={stateOptions}
                  placeholder="Select state"
                  isSubmitting={isSubmitting}
                  sortOptions
                />
                <FormInputField
                  control={form.control}
                  name="zipcode"
                  label="Zipcode"
                  placeholder="10001"
                  isSubmitting={isSubmitting}
                />
              </div>
            </fieldset>

            {/* Occupation */}
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
              <FormField
                control={form.control}
                name="stateOfLicensure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>States of Licensure</FormLabel>
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
            </fieldset>

            {/* Supervision Needs */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Supervision Needs
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="typeOfSupervisorNeeded"
                  label="Type of Supervisor Needed"
                  options={supervisorTypeOptions}
                  placeholder="Select supervisor type"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
                <FormSelectField
                  control={form.control}
                  name="stateTheyAreLookingIn"
                  label="State Looking In"
                  options={stateOptions}
                  placeholder="Select state"
                  isSubmitting={isSubmitting}
                  sortOptions
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="howSoonLooking"
                  label="How Soon Looking"
                  options={howSoonOptions}
                  placeholder="Select timeline"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
                {howSoonLooking === 'CUSTOM_DATE' && (
                  <FormInputField
                    control={form.control}
                    name="lookingDate"
                    label="Looking Date"
                    type="date"
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="preferredFormat"
                  label="Preferred Format"
                  options={FORMAT_OPTIONS}
                  placeholder="Select format"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
                <FormSelectField
                  control={form.control}
                  name="availability"
                  label="Availability"
                  options={availabilityOptions}
                  placeholder="Select availability"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
              </div>
            </fieldset>

            {/* Budget */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Budget
              </legend>
              <FormSelectField
                control={form.control}
                name="budgetRangeType"
                label="Budget Type"
                options={BUDGET_TYPE_OPTIONS}
                placeholder="Select budget type"
                isSubmitting={isSubmitting}
                emptySentinel={{ value: '__none__', label: 'None' }}
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

            {/* About */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About
              </legend>
              <FormField
                control={form.control}
                name="idealSupervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ideal Supervisor / About Me</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Describe what you are looking for in a supervisor and a bit about yourself..."
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            {/* Error */}
            {mutation.isError && (
              <p className="text-sm text-destructive">Failed to save changes. Please try again.</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
