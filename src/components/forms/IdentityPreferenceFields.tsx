'use client'

import { useId } from 'react'
import type { Control, FieldValues, RegisterOptions } from 'react-hook-form'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { TagInput } from '@/components/ui/tag-input'
import {
  CUSTOM_GENDER_IDENTITY_MAX_LENGTH,
  GENDER_IDENTITY_OPTIONS,
  GENDER_IDENTITY_SELF_DESCRIBE,
  LANGUAGE_OPTIONS,
  PRONOUN_OPTIONS,
} from '@/lib/constants/identity-preferences'
import {
  identityPreferenceFieldsSchema,
  type IdentityPreferenceFormValues,
  validateCustomGenderIdentity,
} from '@/lib/forms/identity-preferences'
import { cn } from '@/lib/utils'

type IdentityFieldName = keyof IdentityPreferenceFormValues

type IdentityPreferenceFieldsProps<TFieldValues extends FieldValues> = {
  /** Form control of any form whose values include {@link IdentityPreferenceFormValues}. */
  control: Control<TFieldValues>
  isSubmitting?: boolean
  /**
   * Attach per-field `rules` so fields validate on touch/change (signup's
   * `mode: 'onTouched'` pattern). Forms driven by a Zod resolver leave it off.
   */
  inlineValidation?: boolean
}

/** Same per-field Zod checks as the schema, plus the self-describe requirement. */
function identityFieldRules<N extends IdentityFieldName>(
  name: N,
): RegisterOptions<IdentityPreferenceFormValues, N> {
  return {
    validate: (value: unknown, formValues: IdentityPreferenceFormValues): true | string => {
      if (name === 'customGenderIdentity') return validateCustomGenderIdentity(value, formValues)
      const fieldSchema = identityPreferenceFieldsSchema[name] as ZodTypeAny
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}

function OptionalTag() {
  return <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
}

// ─── Visibility checkbox ──────────────────────────────────────────────────────

function VisibilityCheckboxField({
  control,
  name,
  label,
  disabled,
  hasValue,
}: {
  control: Control<IdentityPreferenceFormValues>
  name: 'showPronouns' | 'showGenderIdentity' | 'showLanguages'
  label: string
  disabled: boolean
  /** The field this checkbox publishes has a value — nothing to display otherwise. */
  hasValue: boolean
}) {
  const checkboxId = useId()
  const inactive = disabled || !hasValue
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-start gap-3">
            <FormControl>
              <Checkbox
                id={checkboxId}
                checked={hasValue && (field.value ?? false)}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                disabled={inactive}
                className="mt-0.5 shrink-0"
              />
            </FormControl>
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm leading-5 select-none',
                inactive
                  ? 'cursor-not-allowed text-muted-foreground'
                  : 'cursor-pointer text-foreground',
              )}
            >
              {label}
            </label>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ─── Fields ───────────────────────────────────────────────────────────────────

/**
 * Pronouns, gender identity, and languages — each optional and each followed
 * by its own "display on my public profile" checkbox (unchecked by default).
 * Shared by the signup Account steps and the profile edit forms.
 */
export function IdentityPreferenceFields<TFieldValues extends FieldValues>({
  control,
  isSubmitting = false,
  inlineValidation = false,
}: IdentityPreferenceFieldsProps<TFieldValues>) {
  // The host form is a superset of the identity fields; narrow once here so the
  // field names below are type-checked against the identity shape.
  const identityControl = control as unknown as Control<IdentityPreferenceFormValues>
  const rules = <N extends IdentityFieldName>(name: N) =>
    inlineValidation ? identityFieldRules(name) : undefined

  const { setValue } = useFormContext<IdentityPreferenceFormValues>()
  const pronouns = useWatch({ control: identityControl, name: 'pronouns' }) ?? []
  const languages = useWatch({ control: identityControl, name: 'languages' }) ?? []
  const genderIdentity = useWatch({ control: identityControl, name: 'genderIdentity' }) ?? ''
  const isSelfDescribe = genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE

  /** A cleared field has nothing to display, so its visibility switches off with it. */
  const syncVisibility = (
    flag: 'showPronouns' | 'showGenderIdentity' | 'showLanguages',
    hasValue: boolean,
  ) => {
    if (!hasValue) setValue(flag, false, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      {/* ── Pronouns ─────────────────────────────────────────────────────── */}
      <FormField
        control={identityControl}
        name="pronouns"
        rules={rules('pronouns')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Pronouns <OptionalTag />
            </FormLabel>
            <FormControl>
              <TagInput
                options={PRONOUN_OPTIONS}
                value={field.value ?? []}
                onChange={(next) => {
                  field.onChange(next)
                  syncVisibility('showPronouns', next.length > 0)
                }}
                onBlur={field.onBlur}
                placeholder="Select your pronouns"
                aria-label="Pronouns"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>Select all that apply.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <VisibilityCheckboxField
        control={identityControl}
        name="showPronouns"
        label="Display my pronouns on my public profile"
        disabled={isSubmitting}
        hasValue={pronouns.length > 0}
      />

      {/* ── Gender identity ──────────────────────────────────────────────── */}
      <FormSelectField
        control={identityControl}
        name="genderIdentity"
        label={
          <>
            Gender Identity <OptionalTag />
          </>
        }
        rules={rules('genderIdentity')}
        options={GENDER_IDENTITY_OPTIONS}
        placeholder="Select your gender identity"
        isSubmitting={isSubmitting}
        onValueChange={(value) => syncVisibility('showGenderIdentity', value !== '')}
      />
      {isSelfDescribe && (
        <FormInputField
          control={identityControl}
          name="customGenderIdentity"
          label="Describe Your Gender Identity"
          rules={rules('customGenderIdentity')}
          placeholder="Enter your gender identity"
          maxLength={CUSTOM_GENDER_IDENTITY_MAX_LENGTH}
          normalizeEmptyToString
          isSubmitting={isSubmitting}
          required
        />
      )}
      <VisibilityCheckboxField
        control={identityControl}
        name="showGenderIdentity"
        label="Display my gender identity on my public profile"
        disabled={isSubmitting}
        hasValue={genderIdentity !== ''}
      />

      {/* ── Languages ────────────────────────────────────────────────────── */}
      <FormField
        control={identityControl}
        name="languages"
        rules={rules('languages')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Languages <OptionalTag />
            </FormLabel>
            <FormControl>
              <TagInput
                options={LANGUAGE_OPTIONS}
                value={field.value ?? []}
                onChange={(next) => {
                  field.onChange(next)
                  syncVisibility('showLanguages', next.length > 0)
                }}
                onBlur={field.onBlur}
                placeholder="Select languages you speak"
                searchable
                searchPlaceholder="Search languages…"
                aria-label="Languages"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <VisibilityCheckboxField
        control={identityControl}
        name="showLanguages"
        label="Display my languages on my public profile"
        disabled={isSubmitting}
        hasValue={languages.length > 0}
      />
    </div>
  )
}
