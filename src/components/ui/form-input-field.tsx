'use client'

import { Eye, EyeOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type FormInputFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: ReactNode
  rules?: RegisterOptions<TFieldValues, TName>
  required?: boolean
  placeholder?: string
  /** Passed to `Input` (default `text`). Ignored when `passwordToggle` is true. */
  type?: React.HTMLInputTypeAttribute
  formItemClassName?: string
  inputClassName?: string
  disabled?: boolean
  /** Disables the control while the form is submitting (e.g. formState.isSubmitting or mutation isPending). */
  isSubmitting?: boolean
  maxLength?: number
  min?: number
  max?: number
  step?: number | string
  autoComplete?: string
  startAdornment?: InputProps['startAdornment']
  endAdornment?: InputProps['endAdornment']
  /**
   * Use `field.value ?? ''` so optional / url fields stay controlled when empty.
   */
  normalizeEmptyToString?: boolean
  /**
   * Password visibility toggle (same pattern as signup account steps).
   */
  passwordToggle?: boolean
  /**
   * For `type="number"`: `onChange` uses `e.target.valueAsNumber` (matches prior signup handlers).
   */
  numberValue?: boolean
  /** Call `clearErrors(name)` after each change. */
  clearErrorsOnChange?: boolean
}

export function FormInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  rules,
  required = false,
  placeholder,
  type = 'text',
  formItemClassName,
  inputClassName,
  disabled,
  isSubmitting = false,
  maxLength,
  min,
  max,
  step,
  autoComplete,
  startAdornment,
  endAdornment,
  normalizeEmptyToString,
  passwordToggle,
  numberValue,
  clearErrorsOnChange,
}: FormInputFieldProps<TFieldValues, TName>) {
  const { clearErrors } = useFormContext<TFieldValues>()
  const [showPassword, setShowPassword] = useState(false)
  const mergedDisabled = Boolean(disabled || isSubmitting)

  const resolvedPasswordType = passwordToggle ? (showPassword ? 'text' : 'password') : undefined

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const inputType = passwordToggle ? resolvedPasswordType! : type

        const inputEl = numberValue ? (
          <Input
            type="number"
            placeholder={placeholder}
            disabled={mergedDisabled}
            min={min}
            max={max}
            step={step}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            className={inputClassName}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={
              field.value === undefined || field.value === null || Number.isNaN(field.value)
                ? ''
                : field.value
            }
            onChange={(e) => {
              field.onChange(e.target.valueAsNumber)
              if (clearErrorsOnChange) clearErrors(name)
            }}
          />
        ) : (
          <Input
            {...field}
            type={inputType}
            placeholder={placeholder}
            disabled={mergedDisabled}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            className={cn(passwordToggle && 'pr-10', inputClassName)}
            value={
              normalizeEmptyToString ? (field.value ?? '') : (field.value as string | undefined)
            }
          />
        )

        return (
          <FormItem className={formItemClassName}>
            <FormLabel>
              {label}
              {required ? (
                <>
                  {' '}
                  <span className="text-destructive">*</span>
                </>
              ) : null}
            </FormLabel>
            <FormControl>
              {passwordToggle ? (
                <div className="relative">
                  {inputEl}
                  <button
                    type="button"
                    disabled={mergedDisabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              ) : (
                inputEl
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
