'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import type { SuperviseeSignupVariant } from './index'

type SuperviseeStepProfileTermsProps = {
  variant?: SuperviseeSignupVariant
  isSubmitting: boolean
}

/** Step 3: optional self introduction + the agreement checkboxes. */
export function SuperviseeStepProfileTerms({
  variant = 'supervisee',
  isSubmitting,
}: SuperviseeStepProfileTermsProps) {
  const isNeedMedicalDirector = variant === 'need-medical-director'
  const { control } = useFormContext<SuperviseeFormValues>()
  const introductionValue = useWatch({ control, name: 'introduction' }) ?? ''

  return (
    <>
      <FormField
        control={control}
        name="introduction"
        rules={superviseeFieldRules('introduction')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Introduce Yourself (optional)</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {introductionValue.length} / 500 characters
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
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
                  agree to be contacted by a prospective{' '}
                  {isNeedMedicalDirector ? 'medical director' : 'supervisor'} via email, messages on{' '}
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
    </>
  )
}
