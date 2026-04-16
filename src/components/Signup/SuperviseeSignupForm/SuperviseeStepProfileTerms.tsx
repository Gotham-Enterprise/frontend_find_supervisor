'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

type SuperviseeStepProfileTermsProps = {
  isSubmitting: boolean
}

export function SuperviseeStepProfileTerms({ isSubmitting }: SuperviseeStepProfileTermsProps) {
  const { control } = useFormContext<SuperviseeFormValues>()
  const descriptionValue = useWatch({ control, name: 'description' }) ?? ''

  return (
    <FormSection title="Profile & Terms">
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
