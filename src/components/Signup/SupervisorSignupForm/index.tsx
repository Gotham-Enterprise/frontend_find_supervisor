'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { supervisorDefaultValues } from '@/components/Signup/helpers'
import {
  supervisionFeeTypeOptions,
  type SupervisorFormValues,
  supervisorSchema,
  yearsOfExperienceOptions,
} from '@/components/Signup/schema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { ProfilePhotoUpload } from '@/components/ui/profile-photo-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import { UploadFile } from '@/components/ui/upload-file'
import {
  useCitiesOptions,
  useStatesOptions,
  useSupervisorFormOptions,
  useSupervisorSignup,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { validateAddressForSignup } from '@/lib/utils/validate-address'

export function SupervisorSignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const { showSuccess, showError, showInfo } = useUserSnackbar()
  const { mutate: signup, isPending } = useSupervisorSignup()

  const {
    certificates: { data: certificateOptions = [], isLoading: certificatesLoading },
    patientPopulations: {
      data: patientPopulationOptions = [],
      isLoading: patientPopulationsLoading,
    },
    licenseTypes: { data: licenseTypeOptions = [], isLoading: licenseTypesLoading },
    availability: { data: availabilityOptions = [], isLoading: availabilityLoading },
    isError: optionsError,
  } = useSupervisorFormOptions()

  const form = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: supervisorDefaultValues,
  })

  const stateValue = useWatch({ control: form.control, name: 'state' }) ?? ''
  const {
    data: stateOptions = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useStatesOptions()
  const {
    data: cityOptions = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = useCitiesOptions(stateValue)

  const professionalSummaryValue =
    useWatch({ control: form.control, name: 'professionalSummary' }) ?? ''
  const describeYourselfValue = useWatch({ control: form.control, name: 'describeYourself' }) ?? ''
  const agreedToPost = useWatch({ control: form.control, name: 'agreedToPost' })
  const agreedToTerms = useWatch({ control: form.control, name: 'agreedToTerms' })
  const canSubmit = agreedToPost && agreedToTerms

  useEffect(() => {
    form.setValue('city', '')
  }, [stateValue, form])

  const locationOptionsError = statesError || citiesError

  async function onSubmit(values: SupervisorFormValues) {
    setIsValidatingAddress(true)
    let addressResult
    try {
      addressResult = await validateAddressForSignup({
        city: values.city,
        state: values.state,
        zipcode: values.zipcode,
      })
    } finally {
      setIsValidatingAddress(false)
    }

    if (!addressResult.valid) {
      showError(addressResult.message ?? 'Please check your address and try again.')
      return
    }

    if (addressResult.message) {
      showInfo(addressResult.message)
    }

    const payload: SupervisorFormValues = {
      ...values,
      ...(addressResult.suggestedCity && { city: addressResult.suggestedCity }),
      ...(addressResult.suggestedState && { state: addressResult.suggestedState }),
    }

    signup(payload, {
      onSuccess: () => {
        showSuccess(
          'Your account has been created. Please check your email to verify your address before logging in.',
        )
      },
      onError: (error) => {
        showError(parseApiError(error))
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {optionsError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Some options failed to load. Please refresh the page.
          </p>
        )}
        {locationOptionsError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {statesError
              ? 'Unable to load states right now.'
              : 'Unable to load cities for the selected state.'}{' '}
            Please refresh the page.
          </p>
        )}

        {/* ── ACCOUNT ─────────────────────────────────────────────── */}
        <FormSection title="Account">
          {/* Profile photo — above all other account fields */}
          <FormField
            control={form.control}
            name="uploadProfilePhoto"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <ProfilePhotoUpload
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputRef={ref}
                    accept=".jpg,.jpeg,.png"
                    size="md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={statesLoading}
                    itemToStringLabel={(val) =>
                      stateOptions.find((o) => o.value === val)?.label ?? val
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={statesLoading ? 'Loading…' : 'Select state'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stateOptions.length === 0 && !statesLoading && !statesError ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No states available.
                        </p>
                      ) : (
                        stateOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!stateValue || citiesLoading}
                    itemToStringLabel={(val) =>
                      cityOptions.find((o) => o.value === val)?.label ?? val
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !stateValue
                              ? 'Select a state first'
                              : citiesLoading
                                ? 'Loading…'
                                : 'Select city'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stateValue && cityOptions.length === 0 && !citiesLoading && !citiesError ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No cities available for this state.
                        </p>
                      ) : (
                        cityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>
                    Zipcode <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* ── LICENSE & CREDENTIALS ───────────────────────────────── */}
        <FormSection title="License & Credentials">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="licenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    License Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={licenseTypesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={licenseTypesLoading ? 'Loading…' : 'Select type'}
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
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    License Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. NY-PT-88241" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="licenseExpiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    License Expiration <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" min={new Date().toISOString().slice(0, 10)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="npiNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    NPI Number{' '}
                    <span className="text-muted-foreground text-xs font-normal">
                      (if applicable)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit NPI number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="certifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Certifications <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <TagInput
                    options={certificateOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder={certificatesLoading ? 'Loading…' : 'Add certification (e.g. CSCS)'}
                    disabled={certificatesLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Years of Experience <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
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
              control={form.control}
              name="licenseDoc"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <FormItem>
                  <FormLabel>
                    License / Verification Doc <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <UploadFile
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      inputRef={ref}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      uploadTitle="Upload file"
                      uploadHint="PDF, JPG, PNG, DOC · up to 5 MB"
                      removeFileAriaLabel="Remove license document"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="stateOfLicensure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  State(s) of Licensure <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <TagInput
                    options={stateOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add a state (e.g. CA)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* ── PRACTICE DETAILS ────────────────────────────────────── */}
        <FormSection title="Practice Details">
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
                    placeholder={
                      patientPopulationsLoading ? 'Loading…' : 'Add population (e.g. Adults)'
                    }
                    disabled={patientPopulationsLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supervisionFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Supervision Format <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <FormatSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Availability <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={availabilityLoading}
                    itemToStringLabel={(val) =>
                      availabilityOptions.find((o) => o.value === val)?.label ?? val
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={availabilityLoading ? 'Loading…' : 'Select availability'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availabilityOptions.map((opt) => (
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
              control={form.control}
              name="acceptingNewSupervisees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accepting New Supervisees?</FormLabel>
                  <FormControl>
                    <div className="flex h-10 items-center justify-between rounded-lg border border-input bg-card px-3">
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Yes, accepting now' : 'Not accepting now'}
                      </span>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supervisionFeeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fee Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Hourly or Monthly" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisionFeeTypeOptions.map((opt) => (
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
              control={form.control}
              name="supervisionFeeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fee Amount <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 100"
                      startAdornment="$"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    rows={4}
                    placeholder="Specializing in orthopedic and sports rehabilitation with extensive experience supervising new graduates..."
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {professionalSummaryValue.length} / 500 characters
                  </span>
                </div>
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
                    rows={4}
                    placeholder="Share your background, approach to supervision, and what makes your practice unique..."
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {describeYourselfValue.length} / 500 characters
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* ── TERMS + SUBMIT ──────────────────────────────────────── */}
        <div className="space-y-4 border-t border-border pt-6">
          <FormField
            control={form.control}
            name="agreedToPost"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 shrink-0"
                    />
                  </FormControl>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    I agree to post my profile on{' '}
                    <span className="font-semibold text-primary">Gotham Enterprises Ltd</span> and
                    agree to be contacted by a prospective supervisee via email, messages on{' '}
                    <span className="font-semibold text-primary">Gotham Enterprises Ltd</span>, SMS
                    text, and phone.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 shrink-0"
                    />
                  </FormControl>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    I agree to all of the terms and conditions of use on{' '}
                    <span className="font-semibold text-primary">Gotham Enterprises Ltd</span>.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!canSubmit || isPending || isValidatingAddress}
          >
            {isValidatingAddress
              ? 'Verifying address…'
              : isPending
                ? 'Creating your account…'
                : 'Sign Up as Supervisor →'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}
