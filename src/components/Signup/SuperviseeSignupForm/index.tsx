'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { ProfilePhotoField } from '@/components/profile-photo/ProfilePhotoField'
import { FormatSelector } from '@/components/Signup/FormatSelector'
import { FormSection } from '@/components/Signup/FormSection'
import { superviseeDefaultValues } from '@/components/Signup/helpers'
import { type SuperviseeFormValues, superviseeSchema } from '@/components/Signup/schema'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import {
  useCitiesOptions,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSuperviseeSignup,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import { validateAddressForSignup } from '@/lib/utils/validate-address'

export function SuperviseeSignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const { showSuccess, showError, showInfo } = useUserSnackbar()
  const { mutate: signup, isPending } = useSuperviseeSignup()

  const {
    availability: { data: availabilityOptions = [], isLoading: availabilityLoading },
    howSoon: { data: howSoonOptions = [], isLoading: howSoonLoading },
    supervisorTypes: { data: supervisorTypeOptions = [], isLoading: supervisorTypesLoading },
    salaryRanges: { data: salaryRangeOptions = [], isLoading: salaryRangesLoading },
    isError: optionsError,
  } = useSuperviseeFormOptions()

  const form = useForm<SuperviseeFormValues>({
    resolver: zodResolver(superviseeSchema),
    defaultValues: superviseeDefaultValues,
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

  const descriptionValue = useWatch({ control: form.control, name: 'description' }) ?? ''
  const agreedToPost = useWatch({ control: form.control, name: 'agreedToPost' })
  const agreedToTerms = useWatch({ control: form.control, name: 'agreedToTerms' })
  const canSubmit = agreedToPost && agreedToTerms

  useEffect(() => {
    form.setValue('city', '')
  }, [stateValue, form])

  async function onSubmit(values: SuperviseeFormValues) {
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

    const payload: SuperviseeFormValues = {
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

  const locationOptionsError = statesError || citiesError

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
              <FormItem>
                <FormLabel>
                  Profile Photo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <ProfilePhotoField
                    ref={ref}
                    value={value instanceof File ? value : null}
                    onChange={onChange}
                    onBlur={onBlur}
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
                    <Input placeholder="Alex Johnson" {...field} />
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
                    <Input type="email" placeholder="alex@example.com" {...field} />
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

        {/* ── SUPERVISION NEEDS ───────────────────────────────────── */}
        <FormSection title="Supervision Needs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="stateOfLicensure"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="stateTheyAreLookingIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State You Are Looking In <span className="text-destructive">*</span>
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
                      {stateOptions.map((opt) => (
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
              name="typeOfSupervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type of Supervisor Needed <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={supervisorTypesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={supervisorTypesLoading ? 'Loading…' : 'Select type'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisorTypeOptions.map((opt) => (
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="howSoon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How Soon Do You Need Supervision? <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={howSoonLoading}
                    itemToStringLabel={(val) =>
                      howSoonOptions.find((o) => o.value === val)?.label ?? val
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={howSoonLoading ? 'Loading…' : 'Select timeframe'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {howSoonOptions.map((opt) => (
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
          </div>

          <FormField
            control={form.control}
            name="preferredFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Preferred Format <span className="text-destructive">*</span>
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
              name="feeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fee Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={[
                      { value: 'per-session', label: 'Per Session' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="per-session">Per Session</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={salaryRangesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={salaryRangesLoading ? 'Loading…' : 'Select budget'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salaryRangeOptions.map((opt) => (
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
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Ideal Supervisor</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Looking for a licensed LCSW with experience in trauma-informed care and CBT. I prefer someone who can provide reflective supervision..."
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {descriptionValue.length} / 500 characters
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
                    agree to be contacted by a prospective supervisor via email, messages on{' '}
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
                : 'Sign Up as Supervisee →'}
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
