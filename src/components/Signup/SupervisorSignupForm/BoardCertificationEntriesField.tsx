'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { emptyBoardCertification } from '@/components/Signup/helpers'
import type { MedicalDirectorFormValues } from '@/components/Signup/schema'
import { boardCertificationFieldRules } from '@/components/Signup/supervisorFieldRules'
import { Button } from '@/components/ui/button'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import type { SelectOption } from '@/lib/api/options'
import {
  certifyingBoardSelectOptions,
  OTHER_CERTIFYING_BOARD_VALUE,
} from '@/lib/utils/board-certification'

type BoardCertificationEntriesFieldProps = {
  /** Physician specialties from the Medical Director type hierarchy. */
  specialtyOptions: SelectOption[]
  specialtiesLoading: boolean
  isSubmitting: boolean
}

/**
 * Field array of board-certification entries (`boardCertifications.${index}.*`),
 * one card per certification — rendered only while "Board Certified?" is Yes.
 * Selecting the "Other" board reveals a free-text board-name input.
 */
export function BoardCertificationEntriesField({
  specialtyOptions,
  specialtiesLoading,
  isSubmitting,
}: BoardCertificationEntriesFieldProps) {
  const { control, clearErrors } = useFormContext<MedicalDirectorFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'boardCertifications' })
  const entries = useWatch({ control, name: 'boardCertifications' }) ?? []

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Board Certification {index + 1}</p>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={isSubmitting}
                aria-label={`Remove board certification ${index + 1}`}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name={`boardCertifications.${index}.certifyingBoard`}
              label="Certifying Board"
              searchable
              rules={boardCertificationFieldRules('certifyingBoard')}
              options={certifyingBoardSelectOptions}
              placeholder="Select certifying board"
              isSubmitting={isSubmitting}
              required
              onValueChange={() => {
                clearErrors(`boardCertifications.${index}.certifyingBoardOther`)
              }}
            />
            <FormSelectField
              control={control}
              name={`boardCertifications.${index}.specialty`}
              label="Specialty"
              searchable
              sortOptions
              rules={boardCertificationFieldRules('specialty')}
              options={specialtyOptions}
              placeholder="Select specialty"
              loading={specialtiesLoading}
              isSubmitting={isSubmitting}
              required
            />
            {entries[index]?.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE ? (
              <FormInputField
                control={control}
                name={`boardCertifications.${index}.certifyingBoardOther`}
                label="Certifying Board (Other)"
                rules={boardCertificationFieldRules('certifyingBoardOther')}
                placeholder="Enter certifying board name"
                maxLength={200}
                isSubmitting={isSubmitting}
                required
              />
            ) : null}
            <FormInputField
              control={control}
              name={`boardCertifications.${index}.subspecialty`}
              label="Subspecialty (optional)"
              placeholder="Enter subspecialty"
              maxLength={200}
              isSubmitting={isSubmitting}
            />
            <FormInputField
              control={control}
              name={`boardCertifications.${index}.certificationNumber`}
              label="Certification Number (optional)"
              placeholder="Enter certification number"
              maxLength={50}
              isSubmitting={isSubmitting}
            />
            <FormInputField
              control={control}
              name={`boardCertifications.${index}.expirationDate`}
              label="Expiration / Valid Through (optional)"
              rules={boardCertificationFieldRules('expirationDate')}
              type="date"
              normalizeEmptyToString
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append(emptyBoardCertification())
          clearErrors('boardCertifications')
        }}
        disabled={isSubmitting}
      >
        <Plus className="size-4" />
        Add another certification
      </Button>
    </div>
  )
}
