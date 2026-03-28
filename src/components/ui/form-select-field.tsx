'use client'

import type { ReactNode } from 'react'
import type { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SelectOption } from '@/lib/api/options'
import { selectBlurHandlers } from '@/lib/form/select-blur-handlers'

export { selectBlurHandlers }

/** Maps empty field values to a non-empty `SelectItem` value (empty string is not allowed). */
export type FormSelectEmptySentinel = {
  value: string
  label: string
  /** Stored in the form when the sentinel is selected. Default `''`. */
  mapsToFieldValue?: string
}

export type FormSelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  /** Visible label text; add `required` for the red asterisk. */
  label: ReactNode
  rules?: RegisterOptions<TFieldValues, TName>
  options: readonly SelectOption[]
  placeholder?: string
  disabled?: boolean
  /** Disables the control while the form is submitting (e.g. formState.isSubmitting or mutation isPending). */
  isSubmitting?: boolean
  required?: boolean
  /** When true, `loadingPlaceholder` is shown and the control is disabled. */
  loading?: boolean
  /** Shown as placeholder while `loading` is true. Defaults to "Loading…". */
  loadingPlaceholder?: string
  /**
   * Maps empty field values to a non-empty select value (e.g. `__none__` for "None") because
   * `SelectItem` cannot use `value=""`.
   */
  emptySentinel?: FormSelectEmptySentinel
  /** Sort options by label (sentinel row stays first when `emptySentinel` is set). */
  sortOptions?: boolean
  /** Override display string for the trigger; default resolves from `options` (+ sentinel). */
  itemToStringLabel?: (value: string | null | undefined) => string
  formItemClassName?: string
  /**
   * Passed to the root `Select` so it remounts when dependencies change (e.g. state selection
   * clears city options).
   */
  selectKey?: string
  /**
   * When `when` is true, renders `children` instead of mapping `options` (e.g. “no cities for this
   * state”). Sentinel items are still rendered when `emptySentinel` is set.
   */
  emptyState?: { when: boolean; children: ReactNode }
}

function defaultItemToStringLabel(
  options: readonly SelectOption[],
  emptySentinel: FormSelectEmptySentinel | undefined,
  val: string | null | undefined,
): string {
  if (emptySentinel && (val == null || val === '' || val === emptySentinel.value)) {
    return emptySentinel.label
  }
  if (val == null || val === '') return ''
  const found = options.find((o) => o.value === val)
  return found?.label ?? String(val)
}

export function FormSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  rules,
  options,
  placeholder,
  disabled = false,
  isSubmitting = false,
  required = false,
  loading = false,
  loadingPlaceholder = 'Loading…',
  emptySentinel,
  sortOptions = false,
  itemToStringLabel: itemToStringLabelProp,
  formItemClassName,
  selectKey,
  emptyState,
}: FormSelectFieldProps<TFieldValues, TName>) {
  const resolvedPlaceholder = loading ? loadingPlaceholder : (placeholder ?? 'Select…')
  const mergedDisabled = Boolean(disabled || isSubmitting)

  const displayOptions = sortOptions
    ? [...options].sort((a, b) => a.label.localeCompare(b.label))
    : [...options]

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const sb = selectBlurHandlers(field)

        const selectValue = emptySentinel
          ? field.value != null && field.value !== ''
            ? String(field.value)
            : emptySentinel.value
          : (field.value ?? '')

        const itemToStringLabel =
          itemToStringLabelProp ??
          ((val: string | null | undefined) =>
            defaultItemToStringLabel(displayOptions, emptySentinel, val))

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
            <Select
              key={selectKey}
              value={selectValue}
              onValueChange={(v) => {
                if (emptySentinel && v === emptySentinel.value) {
                  field.onChange((emptySentinel.mapsToFieldValue ?? '') as (typeof field)['value'])
                } else {
                  field.onChange((v ?? '') as (typeof field)['value'])
                }
              }}
              onOpenChange={sb.onOpenChange}
              disabled={mergedDisabled || loading}
              itemToStringLabel={itemToStringLabel}
            >
              <FormControl>
                <SelectTrigger ref={field.ref} onBlur={sb.onTriggerBlur}>
                  <SelectValue placeholder={resolvedPlaceholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {emptySentinel ? (
                  <SelectItem value={emptySentinel.value}>{emptySentinel.label}</SelectItem>
                ) : null}
                {emptyState?.when
                  ? emptyState.children
                  : displayOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
