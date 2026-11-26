import { isMedicalDirectorType, isPreceptorType } from '@/lib/utils/supervisee-eligibility'

/**
 * Which flavor of the supervisor product a paying account is on. The plan
 * cards (dashboard, Billing, plan modal) word their feature lists per role:
 * supervisors serve supervisees, Medical Directors serve clients, Preceptors
 * host preceptees (students). Gating is identical across the three.
 */
export type SupervisionRoleKind = 'supervisor' | 'medical-director' | 'preceptor'

export function getSupervisionRoleKind(
  supervisorType: string | null | undefined,
): SupervisionRoleKind {
  const name = supervisorType?.trim() ?? ''
  if (!name) return 'supervisor'
  // Legacy rows store the enum code ("MEDICAL_DIRECTOR") instead of the display name.
  const probe = /^[A-Z0-9_]+$/.test(name) ? { code: name } : { name }
  if (isMedicalDirectorType(probe)) return 'medical-director'
  if (isPreceptorType(probe)) return 'preceptor'
  return 'supervisor'
}

export interface PlanFeatureItem {
  label: string
  premium: boolean
}

export interface SupervisionRoleCopy {
  /** Lower-case noun for sentences like "Basic supervisor tools are included." */
  roleNounLower: string
  /** Plural counterpart for "reach supervisees with messaging". */
  counterpartPlural: string
  features: PlanFeatureItem[]
}

const SUPERVISION_PLAN_FEATURES: Record<SupervisionRoleKind, SupervisionRoleCopy> = {
  supervisor: {
    roleNounLower: 'supervisor',
    counterpartPlural: 'supervisees',
    features: [
      { label: 'Receive and view supervisee requests', premium: false },
      { label: 'See visibility into interested supervisees', premium: false },
      { label: 'Basic profile listing in search', premium: false },
      { label: 'Platform notifications for new activity', premium: false },
      { label: 'Accept supervisee requests', premium: true },
      { label: 'Full messaging with supervisees', premium: true },
      { label: 'View supervisee contact details where applicable', premium: true },
      { label: 'Improved discoverability and profile exposure', premium: true },
      { label: 'Unlock full supervisor platform tools', premium: true },
    ],
  },
  'medical-director': {
    roleNounLower: 'medical director',
    counterpartPlural: 'clients',
    features: [
      { label: 'Receive and view client requests', premium: false },
      { label: 'See visibility into interested clients', premium: false },
      { label: 'Basic profile listing in the Medical Director directory', premium: false },
      { label: 'Platform notifications for new activity', premium: false },
      { label: 'Accept client requests', premium: true },
      { label: 'Full messaging with clients', premium: true },
      { label: 'View client contact details where applicable', premium: true },
      { label: 'Improved discoverability and profile exposure', premium: true },
      { label: 'Unlock full Medical Director platform tools', premium: true },
    ],
  },
  preceptor: {
    roleNounLower: 'preceptor',
    counterpartPlural: 'preceptees',
    features: [
      { label: 'Receive and view preceptee requests', premium: false },
      { label: 'See visibility into interested preceptees (students)', premium: false },
      { label: 'Basic profile listing in the Preceptor directory', premium: false },
      { label: 'Platform notifications for new activity', premium: false },
      { label: 'Accept preceptee requests', premium: true },
      { label: 'Full messaging with preceptees', premium: true },
      { label: 'View preceptee contact details where applicable', premium: true },
      { label: 'Improved discoverability and profile exposure', premium: true },
      { label: 'Unlock full Preceptor platform tools', premium: true },
    ],
  },
}

export function getSupervisionRoleCopy(kind: SupervisionRoleKind): SupervisionRoleCopy {
  return SUPERVISION_PLAN_FEATURES[kind]
}

export function getFreePlanFeatures(kind: SupervisionRoleKind): PlanFeatureItem[] {
  return SUPERVISION_PLAN_FEATURES[kind].features.filter((f) => !f.premium)
}

export function getPremiumPlanFeatures(kind: SupervisionRoleKind): PlanFeatureItem[] {
  return SUPERVISION_PLAN_FEATURES[kind].features.filter((f) => f.premium)
}

/** Headings for the supervisor-side "My Profile" page and edit modal. */
export function getSupervisorRoleProfileCopy(supervisorType: string | null | undefined): {
  kind: SupervisionRoleKind
  profileTitle: string
  editTitle: string
  counterpartPlural: string
} {
  const kind = getSupervisionRoleKind(supervisorType)
  const titles: Record<SupervisionRoleKind, string> = {
    supervisor: 'Supervisor Profile',
    'medical-director': 'Medical Director Profile',
    preceptor: 'Preceptor Profile',
  }
  return {
    kind,
    profileTitle: titles[kind],
    editTitle: `Edit ${titles[kind]}`,
    counterpartPlural: SUPERVISION_PLAN_FEATURES[kind].counterpartPlural,
  }
}
