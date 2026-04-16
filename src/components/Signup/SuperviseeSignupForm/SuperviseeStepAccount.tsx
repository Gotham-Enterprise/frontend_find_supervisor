'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { ProfilePhotoField } from '@/components/profile-photo/ProfilePhotoField'
import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { PhoneInput } from '@/components/ui/PhoneInput'
import type { SelectOption } from '@/lib/api/options'

type SuperviseeStepAccountProps = {
  stateOptions: SelectOption[]
  cityOptions: SelectOption[]
  statesLoading: boolean
  citiesLoading: boolean
  statesError: boolean
  citiesError: boolean
  isSubmitting: boolean
}

export function SuperviseeStepAccount({
  stateOptions,
  cityOptions,
  statesLoading,
  citiesLoading,
  statesError,
  citiesError,
  isSubmitting,
}: SuperviseeStepAccountProps) {
  const { control } = useFormContext<SuperviseeFormValues>()
  const stateValue = useWatch({ control, name: 'state' }) ?? ''

  return (
    <FormSection title="Account">
      <FormField
        control={control}
        name="uploadProfilePhoto"
        rules={superviseeFieldRules('uploadProfilePhoto')}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <FormItem>
            <FormLabel>
              Profile Photo <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <ProfilePhotoField
                ref={ref}
                value={value instanceof File ? value : null}
                onChange={(file) => {
                  onChange(file)
                }}
                onBlur={onBlur}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputField
          control={control}
          name="fullName"
          label="Full Name"
          rules={superviseeFieldRules('fullName')}
          placeholder="Enter your full name"
          isSubmitting={isSubmitting}
          required
        />
        <FormInputField
          control={control}
          name="email"
          label="Email Address"
          rules={superviseeFieldRules('email')}
          type="email"
          placeholder="alex@example.com"
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputField
          control={control}
          name="password"
          label="Password"
          rules={superviseeFieldRules('password')}
          placeholder="Min. 8 characters"
          passwordToggle
          isSubmitting={isSubmitting}
          required
        />
        <FormField
          control={control}
          name="contactNumber"
          rules={superviseeFieldRules('contactNumber')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Contact Number <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v)
                  }}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_120px]">
        <FormSelectField
          control={control}
          name="city"
          label="City"
          rules={superviseeFieldRules('city')}
          options={cityOptions}
          placeholder={
            !stateValue ? 'Select a state first' : citiesLoading ? 'Loading…' : 'Select city'
          }
          disabled={!stateValue || citiesLoading}
          selectKey={stateValue || 'no-state'}
          required
          isSubmitting={isSubmitting}
          emptyState={
            stateValue && cityOptions.length === 0 && !citiesLoading && !citiesError
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
          control={control}
          name="state"
          label="State"
          rules={superviseeFieldRules('state')}
          options={stateOptions}
          placeholder="Select state"
          loading={statesLoading}
          required
          isSubmitting={isSubmitting}
          emptyState={
            stateOptions.length === 0 && !statesLoading && !statesError
              ? {
                  when: true,
                  children: (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No states available.</p>
                  ),
                }
              : undefined
          }
        />
        <FormInputField
          control={control}
          name="zipcode"
          label="Zipcode"
          rules={superviseeFieldRules('zipcode')}
          placeholder="ZIP"
          formItemClassName="col-span-2 sm:col-span-1"
          isSubmitting={isSubmitting}
          required
        />
      </div>
    </FormSection>
  )
}
