'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { ProfilePhotoField } from '@/components/profile-photo/ProfilePhotoField'
import { FormSection } from '@/components/Signup/FormSection'
import { type SupervisorFormValues } from '@/components/Signup/schema'
import { supervisorFieldRules } from '@/components/Signup/supervisorFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SelectOption } from '@/lib/api/options'

type SupervisorStepAccountProps = {
  stateOptions: SelectOption[]
  cityOptions: SelectOption[]
  statesLoading: boolean
  citiesLoading: boolean
  statesError: boolean
  citiesError: boolean
}

export function SupervisorStepAccount({
  stateOptions,
  cityOptions,
  statesLoading,
  citiesLoading,
  statesError,
  citiesError,
}: SupervisorStepAccountProps) {
  const { control } = useFormContext<SupervisorFormValues>()
  const [showPassword, setShowPassword] = useState(false)
  const stateValue = useWatch({ control, name: 'state' }) ?? ''

  return (
    <FormSection title="Account">
      <FormField
        control={control}
        name="uploadProfilePhoto"
        rules={supervisorFieldRules('uploadProfilePhoto')}
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="fullName"
          rules={supervisorFieldRules('fullName')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Jane Smith"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          rules={supervisorFieldRules('email')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email Address <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="password"
          rules={supervisorFieldRules('password')}
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
                    onChange={(e) => {
                      field.onChange(e)
                    }}
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
          control={control}
          name="contactNumber"
          rules={supervisorFieldRules('contactNumber')}
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_120px]">
        <FormField
          control={control}
          name="city"
          rules={supervisorFieldRules('city')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                key={stateValue || 'no-state'}
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={!stateValue || citiesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return cityOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
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
                    cityOptions
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((opt) => (
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
          control={control}
          name="state"
          rules={supervisorFieldRules('state')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                State <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v ?? '')
                  field.onBlur()
                }}
                disabled={statesLoading}
                itemToStringLabel={(val) => {
                  if (val == null || val === '') return ''
                  return stateOptions.find((o) => o.value === val)?.label ?? String(val)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                    <SelectValue placeholder={statesLoading ? 'Loading…' : 'Select state'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stateOptions.length === 0 && !statesLoading && !statesError ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No states available.</p>
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
          control={control}
          name="zipcode"
          rules={supervisorFieldRules('zipcode')}
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormLabel>
                Zipcode <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ZIP"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="website"
        rules={supervisorFieldRules('website')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Website <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  field.onChange(e)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  )
}
