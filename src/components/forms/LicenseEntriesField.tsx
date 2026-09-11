'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { emptyLicenseEntry } from '@/components/Signup/helpers'
import {
  licenseEntryFieldRules,
  type LicensesFormShape,
} from '@/components/Signup/supervisorFieldRules'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import type { SelectOption } from '@/lib/api/options'
import { isPhysicianSupervisorType } from '@/lib/utils/supervisor-type'

/** Array paths this component can host — top-level licenses or a Medical Director offering block. */
export type LicenseArrayFieldName =
  | 'licenses'
  | 'offerings.supervising.licenses'
  | 'offerings.collaborating.licenses'

type LicenseEntriesFieldProps = {
  /** Field-array path for the entries (defaults to the top-level `licenses`). */
  name?: LicenseArrayFieldName
  /** License-type options for the selected supervisor type/occupation (hidden for physicians). */
  licenseTypeOptions: SelectOption[]
  stateOptions: SelectOption[]
  licenseTypesLoading?: boolean
  /** Disables the per-entry license-type select until its dependencies are chosen. */
  licenseTypeDisabled?: boolean
  licenseTypePlaceholder?: string
  /** Remounts the license-type selects when their option dependencies change. */
  licenseTypeSelectKey?: string
  isSubmitting: boolean
  /** Per-entry "please confirm" flags for legacy-migrated licenses (profile edit only). */
  entriesNeedingReview?: boolean[]
}

/**
 * Field array of license entries (`licenses.${index}.*`), one card per license,
 * each tied to its own state. Shared by supervisor signup and profile edit;
 * the host form must match `LicensesFormShape`. Physicians pick a single
 * top-level degree type instead of a per-entry license type.
 */
export function LicenseEntriesField({
  name = 'licenses',
  licenseTypeOptions,
  stateOptions,
  licenseTypesLoading = false,
  licenseTypeDisabled = false,
  licenseTypePlaceholder,
  licenseTypeSelectKey,
  isSubmitting,
  entriesNeedingReview,
}: LicenseEntriesFieldProps) {
  const { control, clearErrors } = useFormContext<LicensesFormShape>()
  const supervisorType = useWatch({ control, name: 'supervisorType' }) ?? ''
  const physicianSupervisorType = isPhysicianSupervisorType(supervisorType)
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">License {index + 1}</p>
              {entriesNeedingReview?.[index] ? (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                  Please confirm this license&rsquo;s details
                </Badge>
              ) : null}
            </div>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={isSubmitting}
                aria-label={`Remove license ${index + 1}`}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!physicianSupervisorType ? (
              <FormSelectField
                control={control}
                name={`${name}.${index}.licenseType`}
                label="License Type"
                rules={licenseEntryFieldRules('licenseType')}
                options={licenseTypeOptions}
                placeholder={licenseTypePlaceholder ?? 'Select License Type'}
                loading={licenseTypesLoading}
                disabled={licenseTypeDisabled}
                selectKey={licenseTypeSelectKey}
                isSubmitting={isSubmitting}
                required
              />
            ) : null}
            <FormSelectField
              control={control}
              name={`${name}.${index}.state`}
              label="State of Licensure"
              rules={licenseEntryFieldRules('state')}
              options={stateOptions}
              placeholder="Select State"
              isSubmitting={isSubmitting}
              required
            />
            <FormInputField
              control={control}
              name={`${name}.${index}.licenseNumber`}
              label="License Number"
              rules={licenseEntryFieldRules('licenseNumber')}
              placeholder="Enter License Number"
              isSubmitting={isSubmitting}
              required
            />
            <FormInputField
              control={control}
              name={`${name}.${index}.licenseExpiration`}
              label="License Expiration"
              rules={licenseEntryFieldRules('licenseExpiration')}
              type="date"
              normalizeEmptyToString
              isSubmitting={isSubmitting}
              required
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append({ ...emptyLicenseEntry })
          clearErrors(name)
        }}
        disabled={isSubmitting}
      >
        <Plus className="size-4" />
        Add another license
      </Button>
    </div>
  )
}
