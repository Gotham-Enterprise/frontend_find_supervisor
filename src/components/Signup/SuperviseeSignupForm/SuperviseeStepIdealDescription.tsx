'use client'

import type { ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { FormSection } from '@/components/Signup/FormSection'
import { type SuperviseeFormValues } from '@/components/Signup/schema'
import { superviseeFieldRules } from '@/components/Signup/superviseeFieldRules'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import type { SuperviseeSignupVariant } from './index'

type SuperviseeStepIdealDescriptionProps = {
  variant?: SuperviseeSignupVariant
  isSubmitting: boolean
  /** Rendered after the description — the regular flow slots the Medical
   *  Director section here (Step 2 closes with it). */
  medicalDirectorSection?: ReactNode
}

/**
 * Step 2 tail: the ideal-supervisor description (relabeled for MD-only
 * signups, whose single description serves the Medical Director need and is
 * copied into mdIdealDescription by the payload builder).
 */
export function SuperviseeStepIdealDescription({
  variant = 'supervisee',
  isSubmitting,
  medicalDirectorSection,
}: SuperviseeStepIdealDescriptionProps) {
  const isNeedMedicalDirector = variant === 'need-medical-director'
  const { control } = useFormContext<SuperviseeFormValues>()
  const descriptionValue = useWatch({ control, name: 'description' }) ?? ''
  const typeOfSupervisor = useWatch({ control, name: 'typeOfSupervisor' }) ?? ''
  const needsMedicalDirector = useWatch({ control, name: 'needsMedicalDirector' }) ?? false
  const describesMedicalDirector =
    isNeedMedicalDirector || (needsMedicalDirector && !typeOfSupervisor)

  return (
    <>
      <FormSection title={describesMedicalDirector ? 'Ideal Medical Director' : 'Ideal Supervisor'}>
        <FormField
          control={control}
          name="description"
          rules={superviseeFieldRules('description')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {describesMedicalDirector
                  ? 'Description of Ideal Medical Director'
                  : 'Description of Ideal Supervisor'}{' '}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder={
                    describesMedicalDirector ? undefined : 'Describe Your Ideal Supervisor…'
                  }
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
      </FormSection>

      {medicalDirectorSection}
    </>
  )
}
