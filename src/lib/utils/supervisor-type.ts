/** Keep in sync with backend `utils/supervisor-type.js` and admin `supervisorSignupOptions.ts`. */
import type { RefinementCtx } from 'zod'

export const PHYSICIAN_SUPERVISOR_TYPES = [
  'Collaborating Physician',
  'Supervising Physician',
] as const

export function isPhysicianSupervisorType(supervisorType: string): boolean {
  return (PHYSICIAN_SUPERVISOR_TYPES as readonly string[]).includes(supervisorType)
}

export const PHYSICIAN_CERTIFICATIONS_DISABLED_MESSAGE =
  'Certifications are not required for Collaborating or Supervising Physicians.'

export function getSupervisorCredentialTypeLabel(supervisorType: string): string {
  return isPhysicianSupervisorType(supervisorType) ? 'Degree Type' : 'License Type'
}

export const PHYSICIAN_DEGREE_TYPE_OPTIONS = ['MD', 'DO'] as const

export const physicianDegreeTypeSelectOptions = PHYSICIAN_DEGREE_TYPE_OPTIONS.map((value) => ({
  label: value,
  value,
}))

export function isValidPhysicianDegreeType(value: string): boolean {
  return (PHYSICIAN_DEGREE_TYPE_OPTIONS as readonly string[]).includes(value.trim())
}

type CredentialNameItem = { name: string }

type SupervisorTypeHierarchyOccupation = {
  licenseTypes?: CredentialNameItem[]
  degreeTypes?: CredentialNameItem[]
}

type SupervisorTypeHierarchy = {
  name: string
  occupations: SupervisorTypeHierarchyOccupation[]
}

export function getSupervisorCredentialSelectOptions(
  selectedType: SupervisorTypeHierarchy | undefined,
  selectedOccupation: SupervisorTypeHierarchyOccupation | undefined,
): { label: string; value: string }[] {
  if (!selectedType) return []

  if (isPhysicianSupervisorType(selectedType.name)) {
    const source = selectedOccupation?.degreeTypes?.length
      ? selectedOccupation.degreeTypes
      : selectedType.occupations.find((occupation) => occupation.degreeTypes?.length)?.degreeTypes

    if (source?.length) {
      return source.map((item) => ({ label: item.name, value: item.name }))
    }

    return [...physicianDegreeTypeSelectOptions]
  }

  if (!selectedOccupation) return []

  return (selectedOccupation.licenseTypes ?? []).map((item) => ({
    label: item.name,
    value: item.name,
  }))
}

export function getSupervisorDisplayCredential(profile: {
  supervisorType?: string | null
  licenseType?: string | null
  degreeType?: string | null
}): string {
  const supervisorType = profile.supervisorType?.trim() ?? ''
  const licenseType = profile.licenseType?.trim() ?? ''
  const degreeType = profile.degreeType?.trim() ?? ''

  if (isPhysicianSupervisorType(supervisorType) || !licenseType) {
    return degreeType || licenseType
  }

  return licenseType
}

function applySupervisorPhysicianRules(
  data: {
    supervisorType: string
    licenseType: string
    degreeType: string
    certifications: string[]
  },
  ctx: RefinementCtx,
) {
  const physician = isPhysicianSupervisorType(data.supervisorType)

  if (physician) {
    if (!data.degreeType?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['degreeType'],
        message: 'Degree type is required',
      })
    } else if (!isValidPhysicianDegreeType(data.degreeType)) {
      ctx.addIssue({
        code: 'custom',
        path: ['degreeType'],
        message: 'Degree type must be MD or DO',
      })
    }
  } else if (!data.licenseType?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['licenseType'],
      message: 'License type is required',
    })
  }

  if (!physician && data.certifications.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['certifications'],
      message: 'Add at least one certification',
    })
  }
}

export { applySupervisorPhysicianRules }
