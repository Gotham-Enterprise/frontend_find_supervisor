'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { Textarea } from '@/components/ui/textarea'
import type { SelectOption } from '@/lib/api/options'
import {
  SUPERVISEE_CREDENTIAL_TITLE_LABEL,
  SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER,
} from '@/lib/forms/supervisee-profile-edit'
import { useSpecialtiesByOccupation } from '@/lib/hooks/useSignupOptions'

type SuperviseeStepProfileTermsProps = {
  occupationOptions: SelectOption[]
  occupationsLoading: boolean
  isSubmitting: boolean
}

export function SuperviseeStepProfileTerms({
  occupationOptions,
  occupationsLoading,
  isSubmitting,
}: SuperviseeStepProfileTermsProps) {
  const { control, setValue, clearErrors } = useFormContext<SuperviseeFormValues>()
  const descriptionValue = useWatch({ control, name: 'description' }) ?? ''
  const occupationId = useWatch({ control, name: 'occupationId' }) ?? ''

  const { data: specialtyOptions = [], isLoading: specialtiesLoading } =
    useSpecialtiesByOccupation(occupationId)

  return (
    <FormSection title="Profile & Terms">
      <FormInputField
        control={control}
        name="title"
        label={SUPERVISEE_CREDENTIAL_TITLE_LABEL}
        rules={superviseeFieldRules('title')}
        placeholder={SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER}
        isSubmitting={isSubmitting}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="occupationId"
          label="Occupation"
          rules={superviseeFieldRules('occupationId')}
          options={occupationOptions}
          placeholder="Select occupation"
          loading={occupationsLoading}
          isSubmitting={isSubmitting}
          required
          onValueChange={() => {
            setValue('specialtyId', '')
            clearErrors('specialtyId')
          }}
        />

        <FormSelectField
          control={control}
          name="specialtyId"
          label="Specialty"
          options={specialtyOptions}
          placeholder={
            !occupationId
              ? 'Select an occupation first'
              : specialtyOptions.length === 0 && !specialtiesLoading
                ? 'No specialties available'
                : 'Select specialty'
          }
          loading={specialtiesLoading}
          isSubmitting={isSubmitting || !occupationId}
          selectKey={occupationId}
        />
      </div>

      <FormField
        control={control}
        name="description"
        rules={superviseeFieldRules('description')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description of Ideal Supervisor <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Describe your ideal supervisor…"
                maxLength={500}
                disabled={isSubmitting}
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

      <div className="space-y-4 pt-2">
        <FormField
          control={control}
          name="agreedToPost"
          rules={superviseeFieldRules('agreedToPost')}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
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
          control={control}
          name="agreedToTerms"
          rules={superviseeFieldRules('agreedToTerms')}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
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
      </div>
    </FormSection>
  )
}
