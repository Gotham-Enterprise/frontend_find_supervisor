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
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/lib/contexts/UserContext'
import {
  useAvailabilityOptions,
  useCertificateOptions,
  useLicenseTypeOptions,
  useOccupationOptions,
  usePatientPopulationOptions,
  useSpecialtiesByOccupation,
  useStatesOptions,
} from '@/lib/hooks'
import { useUpdateSupervisorProfile } from '@/lib/hooks/useUpdateSupervisorProfile'
import { normalizeUSPhoneNumber } from '@/lib/utils/phone'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

// ─── Schema ───────────────────────────────────────────────────────────────────

const FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
] as const

const FEE_TYPE_OPTIONS = [
  { label: 'Hourly', value: 'HOURLY' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

const editSupervisorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  contactNumber: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipcode: z
    .string()
    .max(10)
    .optional()
    .refine((v) => !v || /^\d{5}(-\d{4})?$/.test(v), 'Enter a valid US zipcode'),
  website: z
    .string()
    .max(200)
    .optional()
    .refine((v) => !v || /^https?:\/\/\S+/.test(v), 'Enter a valid URL (e.g. https://example.com)'),
  occupationId: z.string().optional(),
  specialtyId: z.string().optional(),
  licenseType: z.string().optional(),
  licenseNumber: z.string().max(50).optional(),
  licenseExpiration: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  npiNumber: z.string().max(20).optional(),
  certification: z.array(z.string()).optional(),
  stateOfLicensure: z.array(z.string()).optional(),
  patientPopulation: z.array(z.string()).optional(),
  supervisionFormat: z.string().optional(),
  availability: z.string().optional(),
  acceptingSupervisees: z.boolean().optional(),
  describeYourself: z.string().max(500).optional(),
  professionalSummary: z.string().max(500).optional(),
  supervisionFeeType: z.string().optional(),
  supervisionFeeAmount: z.number().optional(),
  uploadProfilePhoto: z.any().optional(),
})

type EditSupervisorFormValues = z.infer<typeof editSupervisorSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditSupervisorProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: SupervisorProfileData
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditSupervisorProfileModal({
  open,
  onOpenChange,
  profile,
}: EditSupervisorProfileModalProps) {
  const { user } = useUser()
  const userId = user?.id ?? ''

  const mutation = useUpdateSupervisorProfile(userId)

  const { data: stateOptions = [] } = useStatesOptions()
  const { data: licenseTypeOptions = [] } = useLicenseTypeOptions()
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  const { data: certificationOptions = [] } = useCertificateOptions()
  const { data: patientPopulationOptions = [] } = usePatientPopulationOptions()
  const { data: occupationOptions = [] } = useOccupationOptions()

  const defaultOccupationId = String(
    profile.occupationId ?? profile.occupation?.id ?? profile.user.occupation?.id ?? '',
  )
  const defaultSpecialtyId = String(
    profile.specialtyId ?? profile.specialty?.id ?? profile.user.specialty?.id ?? '',
  )

  const form = useForm<EditSupervisorFormValues>({
    resolver: zodResolver(editSupervisorSchema),
    defaultValues: {
      fullName: profile.user.fullName ?? '',
      contactNumber: profile.user.contactNumber ?? '',
      city: profile.user.city ?? '',
      state: profile.user.state ?? '',
      zipcode: profile.user.zipcode ?? '',
      website: profile.website ?? '',
      occupationId: defaultOccupationId,
      specialtyId: defaultSpecialtyId,
      licenseType: profile.licenseType ?? '',
      licenseNumber: profile.licenseNumber ?? '',
      licenseExpiration: profile.licenseExpiration ? profile.licenseExpiration.slice(0, 10) : '',
      yearsOfExperience: profile.yearsOfExperience ?? '',
      npiNumber: profile.npiNumber ?? '',
      certification: profile.certification ?? [],
      stateOfLicensure: profile.user.stateOfLicensure ?? [],
      patientPopulation: profile.patientPopulation ?? [],
      supervisionFormat: profile.supervisionFormat ?? '',
      availability: profile.availability ?? '',
      acceptingSupervisees: profile.acceptingSupervisees,
      describeYourself: profile.describeYourself ?? '',
      professionalSummary: profile.professionalSummary ?? '',
      supervisionFeeType: profile.supervisionFeeType ?? '',
      supervisionFeeAmount: profile.supervisionFeeAmount ?? undefined,
      uploadProfilePhoto: undefined,
    },
  })

  const selectedOccupationId = useWatch({ control: form.control, name: 'occupationId' }) ?? ''
  const { data: specialtyOptions = [] } = useSpecialtiesByOccupation(selectedOccupationId)

  // Reset form when modal opens with fresh profile data
  useEffect(() => {
    if (open) {
      form.reset({
        fullName: profile.user.fullName ?? '',
        contactNumber: profile.user.contactNumber ?? '',
        city: profile.user.city ?? '',
        state: profile.user.state ?? '',
        zipcode: profile.user.zipcode ?? '',
        website: profile.website ?? '',
        occupationId: defaultOccupationId,
        specialtyId: defaultSpecialtyId,
        licenseType: profile.licenseType ?? '',
        licenseNumber: profile.licenseNumber ?? '',
        licenseExpiration: profile.licenseExpiration ? profile.licenseExpiration.slice(0, 10) : '',
        yearsOfExperience: profile.yearsOfExperience ?? '',
        npiNumber: profile.npiNumber ?? '',
        certification: profile.certification ?? [],
        stateOfLicensure: profile.user.stateOfLicensure ?? [],
        patientPopulation: profile.patientPopulation ?? [],
        supervisionFormat: profile.supervisionFormat ?? '',
        availability: profile.availability ?? '',
        acceptingSupervisees: profile.acceptingSupervisees,
        describeYourself: profile.describeYourself ?? '',
        professionalSummary: profile.professionalSummary ?? '',
        supervisionFeeType: profile.supervisionFeeType ?? '',
        supervisionFeeAmount: profile.supervisionFeeAmount ?? undefined,
        uploadProfilePhoto: undefined,
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: EditSupervisorFormValues) {
    await mutation.mutateAsync({
      fullName: values.fullName,
      contactNumber: values.contactNumber
        ? (normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
        : undefined,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode || undefined,
      website: values.website || undefined,
      occupation: values.occupationId || undefined,
      specialty: values.specialtyId || undefined,
      licenseType: values.licenseType || undefined,
      licenseNumber: values.licenseNumber || undefined,
      licenseExpiration: values.licenseExpiration || undefined,
      yearsOfExperience: values.yearsOfExperience || undefined,
      npiNumber: values.npiNumber || undefined,
      certification: values.certification,
      stateOfLicensure: values.stateOfLicensure,
      patientPopulation: values.patientPopulation,
      supervisionFormat: values.supervisionFormat || undefined,
      availability: values.availability || undefined,
      acceptingSupervisees: values.acceptingSupervisees,
      describeYourself: values.describeYourself || undefined,
      professionalSummary: values.professionalSummary || undefined,
      supervisionFeeType: values.supervisionFeeType || undefined,
      supervisionFeeAmount: values.supervisionFeeAmount,
      uploadProfilePhoto:
        values.uploadProfilePhoto instanceof File ? values.uploadProfilePhoto : undefined,
    })
    onOpenChange(false)
  }

  const isSubmitting = form.formState.isSubmitting || mutation.isPending

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="mb-4">Edit Supervisor Profile</DialogTitle>

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
              <FormInputField
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://example.com"
                normalizeEmptyToString
                isSubmitting={isSubmitting}
              />
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
            </fieldset>

            {/* License & Credentials */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                License &amp; Credentials
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="licenseType"
                  label="License Type"
                  options={licenseTypeOptions}
                  placeholder="Select license type"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
                <FormInputField
                  control={form.control}
                  name="licenseNumber"
                  label="License Number"
                  placeholder="LIC-12345"
                  isSubmitting={isSubmitting}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInputField
                  control={form.control}
                  name="licenseExpiration"
                  label="License Expiration"
                  type="date"
                  isSubmitting={isSubmitting}
                />
                <FormInputField
                  control={form.control}
                  name="yearsOfExperience"
                  label="Years of Experience"
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
              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
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

            {/* Practice Details */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Practice Details
              </legend>
              <FormField
                control={form.control}
                name="patientPopulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Population</FormLabel>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="supervisionFeeType"
                  label="Fee Type"
                  options={FEE_TYPE_OPTIONS}
                  placeholder="Select fee type"
                  isSubmitting={isSubmitting}
                  emptySentinel={{ value: '__none__', label: 'None' }}
                />
                <FormInputField
                  control={form.control}
                  name="supervisionFeeAmount"
                  label="Fee Amount ($)"
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

            {/* Bio */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About You
              </legend>
              <FormField
                control={form.control}
                name="professionalSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary</FormLabel>
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
                    <FormLabel>Describe Yourself</FormLabel>
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
