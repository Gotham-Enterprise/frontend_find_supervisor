'use client'

import { CalendarDays } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { cn } from '@/lib/utils'
import { todayLocalISO } from '@/lib/utils/date'

/**
 * The student fields both forms (signup + profile edit) carry — the component
 * reads them from whichever form context it is rendered in.
 */
export type PrecepteeProgramFormValues = {
  schoolName: string
  degreeProgram: string
  expectedGraduation: string
  clinicalHoursRequired?: number
  rotationStartDate?: string
  rotationEndDate?: string
}

type PrecepteeDateFieldName = 'expectedGraduation' | 'rotationStartDate' | 'rotationEndDate'

type PrecepteeDateFieldProps = {
  name: PrecepteeDateFieldName
  label: string
  required?: boolean
  min?: string
  isSubmitting: boolean
  validate?: (value: string) => true | string
}

function PrecepteeDateField({
  name,
  label,
  required = false,
  min,
  isSubmitting,
  validate,
}: PrecepteeDateFieldProps) {
  const { control, clearErrors } = useFormContext<PrecepteeProgramFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: (value: unknown) => {
          const v = String(value ?? '').trim()
          if (required && !v) return `${label} is required`
          return validate ? validate(v) : true
        },
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                min={min}
                disabled={isSubmitting}
                value={field.value ?? ''}
                onChange={(e) => {
                  field.onChange(e.target.value)
                  clearErrors(name)
                }}
                onBlur={field.onBlur}
                className={cn(
                  'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  '[color-scheme:light]',
                )}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type PrecepteeProgramFieldsProps = {
  isSubmitting: boolean
}

/**
 * Preceptee (student) program details — replace the credential + state of
 * licensure a licensed supervisee gives. Backed by the SuperviseeProfile
 * student columns (schoolName, degreeProgram, expectedGraduation,
 * clinicalHoursRequired, rotationStartDate, rotationEndDate).
 */
export function PrecepteeProgramFields({ isSubmitting }: PrecepteeProgramFieldsProps) {
  const { control, getValues } = useFormContext<PrecepteeProgramFormValues>()
  const today = todayLocalISO()

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputField
          control={control}
          name="schoolName"
          label="School / University"
          rules={{
            validate: (value: unknown) =>
              String(value ?? '').trim() ? true : 'School name is required',
          }}
          placeholder="e.g. University of Texas at Austin"
          maxLength={200}
          isSubmitting={isSubmitting}
          required
        />
        <FormInputField
          control={control}
          name="degreeProgram"
          label="Degree Program"
          rules={{
            validate: (value: unknown) =>
              String(value ?? '').trim() ? true : 'Degree program is required',
          }}
          placeholder="e.g. MSN-FNP, DPT, PharmD"
          maxLength={200}
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PrecepteeDateField
          name="expectedGraduation"
          label="Expected Graduation"
          required
          min={today}
          isSubmitting={isSubmitting}
          validate={(value) =>
            value && value < today ? 'Expected graduation must be today or later' : true
          }
        />
        <FormInputField
          control={control}
          name="clinicalHoursRequired"
          label="Clinical Hours Required"
          type="number"
          min={1}
          max={10000}
          placeholder="e.g. 180"
          description="Field hours your program requires for this rotation."
          numberValue
          clearErrorsOnChange
          isSubmitting={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PrecepteeDateField
          name="rotationStartDate"
          label="Rotation Start (Optional)"
          min={today}
          isSubmitting={isSubmitting}
        />
        <PrecepteeDateField
          name="rotationEndDate"
          label="Rotation End (Optional)"
          min={today}
          isSubmitting={isSubmitting}
          validate={(value) => {
            const start = String(getValues('rotationStartDate') ?? '').trim()
            if (value && start && Date.parse(value) < Date.parse(start)) {
              return 'Rotation end date must be on or after the start date'
            }
            return true
          }}
        />
      </div>
    </>
  )
}
