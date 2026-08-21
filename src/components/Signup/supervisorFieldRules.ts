import type { ZodTypeAny } from 'zod'

import {
  type BoardCertificationEntryValues,
  licenseEntrySchema,
  type LicenseEntryValues,
  type MedicalDirectorFormValues,
  type OfferingKey,
  type SupervisorFormValues,
  supervisorSchemaObject,
} from '@/components/Signup/schema'
import { OTHER_CERTIFYING_BOARD_VALUE } from '@/lib/utils/board-certification'
import { todayLocalISO } from '@/lib/utils/date'
import { isPhysicianSupervisorType, isValidPhysicianDegreeType } from '@/lib/utils/supervisor-type'

/**
 * Per-field `rules` for Controller so RHF validates after touch (`mode: 'onTouched'`) and
 * re-validates on change (`reValidateMode: 'onChange'`), including clearing manual `setError`
 * from step validation when the value becomes valid. Use on each step field that mirrors Zod.
 */
export function supervisorFieldRules<N extends keyof SupervisorFormValues>(name: N) {
  return {
    validate: (value: unknown, formValues: SupervisorFormValues): true | string => {
      const supervisorType = formValues?.supervisorType ?? ''

      if (name === 'degreeType') {
        if (!isPhysicianSupervisorType(supervisorType)) return true
        if (!String(value ?? '').trim()) return 'Degree type is required'
        if (!isValidPhysicianDegreeType(String(value))) return 'Degree type must be MD or DO'
        return true
      }

      if (name === 'certifications') {
        if (isPhysicianSupervisorType(supervisorType)) return true
        if (!Array.isArray(value) || value.length === 0) {
          return 'Add at least one certification'
        }
        return true
      }

      const fieldSchema = supervisorSchemaObject.shape[name] as ZodTypeAny | undefined
      if (!fieldSchema) return true
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}

/**
 * Minimal form shape shared by every form that hosts a `licenses` field array
 * (supervisor signup + supervisor profile edit). `offerings` exists only on
 * the Medical Director signup variant, whose blocks reuse LicenseEntriesField
 * with a nested array path.
 */
export type LicensesFormShape = {
  supervisorType: string
  licenses: LicenseEntryValues[]
  offerings?: {
    supervising: { licenses: LicenseEntryValues[] }
    collaborating: { licenses: LicenseEntryValues[] }
  }
}

/**
 * Per-field `rules` for the Medical Director offering blocks
 * (`offerings.<key>.occupation` / `offerings.<key>.degreeType`). No-ops while
 * the matching "Offer as …" checkbox is unchecked so hidden blocks never fail
 * inline validation; the step schema applies the same conditional rules.
 */
/**
 * Per-field `rules` for board-certification entries
 * (`boardCertifications.${index}.<field>`). No-ops while "Board Certified?"
 * is No so hidden entries never fail inline validation; the step schema
 * applies the same conditional rules.
 */
export function boardCertificationFieldRules<N extends keyof BoardCertificationEntryValues>(
  name: N,
) {
  return {
    validate: (value: unknown, formValues: MedicalDirectorFormValues): true | string => {
      if (!formValues?.boardCertified) return true

      const text = String(value ?? '').trim()
      if (name === 'certifyingBoard') {
        return text ? true : 'Certifying board is required'
      }
      if (name === 'specialty') {
        return text ? true : 'Specialty is required'
      }
      if (name === 'certificationNumber') {
        return text ? true : 'Certification number is required'
      }
      if (name === 'expirationDate') {
        if (!text) return 'Expiration date is required'
        if (text < todayLocalISO()) return 'Expiration cannot be a past date'
        return true
      }
      // certifyingBoardOther is validated by its own conditional render — required
      // only while the board select is "Other".
      if (name === 'certifyingBoardOther') {
        const boardIsOther = formValues.boardCertifications?.some(
          (entry) =>
            entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE &&
            entry.certifyingBoardOther === value,
        )
        if (boardIsOther && !text) return 'Please enter the certifying board name'
        return true
      }
      return true
    },
  }
}

export function offeringFieldRules(offeringKey: OfferingKey, name: 'occupation' | 'degreeType') {
  return {
    validate: (value: unknown, formValues: MedicalDirectorFormValues): true | string => {
      const checked =
        offeringKey === 'supervising'
          ? formValues?.offerSupervisingPhysician
          : formValues?.offerCollaboratingPhysician
      if (!checked) return true

      const text = String(value ?? '').trim()
      if (name === 'occupation') {
        return text ? true : 'Occupation is required'
      }
      if (!text) return 'Degree type is required'
      return isValidPhysicianDegreeType(text) ? true : 'Degree type must be MD or DO'
    },
  }
}

/**
 * Per-field `rules` for Controllers inside the `licenses` field array
 * (`licenses.${index}.<field>`), which `supervisorFieldRules` cannot address
 * (it is keyed by top-level fields). `licenseType` is only required for
 * non-physicians; physicians use the shared top-level `degreeType`.
 */
export function licenseEntryFieldRules<N extends keyof LicenseEntryValues>(name: N) {
  return {
    validate: (value: unknown, formValues: LicensesFormShape): true | string => {
      if (name === 'licenseType') {
        const supervisorType = formValues?.supervisorType ?? ''
        if (isPhysicianSupervisorType(supervisorType)) return true
        if (!String(value ?? '').trim()) return 'License type is required'
        return true
      }

      const fieldSchema = licenseEntrySchema.shape[name] as ZodTypeAny | undefined
      if (!fieldSchema) return true
      const result = fieldSchema.safeParse(value)
      if (result.success) return true
      return result.error.issues[0]?.message ?? 'Invalid'
    },
  }
}
