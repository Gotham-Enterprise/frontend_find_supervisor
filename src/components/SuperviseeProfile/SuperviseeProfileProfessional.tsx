import type { SelectOption } from '@/lib/api/options'
import {
  getVisibleGenderIdentityLabel,
  getVisibleLanguageLabels,
} from '@/lib/utils/identity-display'
import {
  formatCredentialWithState,
  formatDate,
  formatLocation,
  resolveOptionLabels,
  resolveSupervisorTypeLabel,
} from '@/lib/utils/profile-formatters'
import { isPreceptorType } from '@/lib/utils/supervisee-eligibility'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileProfessionalProps {
  profile: SuperviseeProfileViewData
  supervisorTypeOptions: SelectOption[]
  stateOptions: SelectOption[]
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-[#F3F4F6] py-3 last:border-0">
      <span className="shrink-0 text-sm font-medium text-[#181818]">{label}</span>
      <span className="text-right text-sm text-[#6B7280]">{children}</span>
    </div>
  )
}

function TagRow({
  values,
  variant = 'default',
  displayValues,
}: {
  values: string[]
  variant?: 'default' | 'licensure'
  displayValues?: string[]
}) {
  if (values.length === 0) return <span className="text-sm text-[#6B7280]">N/A</span>
  const pillClass =
    variant === 'licensure'
      ? 'rounded-full border border-[#6ee7b7] bg-[#d1fae5] px-2.5 py-0.5 text-xs font-semibold text-[#14532d]'
      : 'rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-xs text-[#374151]'
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {values.map((v, i) => (
        <span key={v} className={pillClass}>
          {displayValues && displayValues[i] !== undefined ? displayValues[i] : v}
        </span>
      ))}
    </div>
  )
}

export function SuperviseeProfileProfessional({
  profile,
  supervisorTypeOptions,
  stateOptions,
}: SuperviseeProfileProfessionalProps) {
  const user = profile.user
  const occupation = user.occupation?.name ?? profile.superviseeOccupation
  const specialty = user.specialty?.name ?? profile.superviseeSpecialty
  const statesOfLicensure = user.stateOfLicensure ?? []
  const licensureLabels = resolveOptionLabels(statesOfLicensure, stateOptions)
  const location = formatLocation(user.city, user.state, user.zipcode)
  const supervisorTypes = resolveSupervisorTypeLabel(
    profile.typeOfSupervisorNeeded,
    supervisorTypeOptions,
  )

  // Each identity block honors its own visibility flag ("Prefer not to say" never shows).
  const genderIdentity = getVisibleGenderIdentityLabel(user)
  const languages = getVisibleLanguageLabels(user)

  // Preceptee (student) profiles carry program details instead of a credential.
  const isPreceptee = (profile.typeOfSupervisorNeeded ?? []).some((name) =>
    isPreceptorType({ name }),
  )
  const rotationWindow = [profile.rotationStartDate, profile.rotationEndDate]
    .map((value) => (value ? formatDate(value) : ''))
    .filter(Boolean)
    .join(' to ')

  const hasContent =
    profile.title ||
    profile.schoolName ||
    profile.degreeProgram ||
    occupation ||
    specialty ||
    genderIdentity ||
    languages.length > 0 ||
    statesOfLicensure.length > 0 ||
    location !== 'N/A' ||
    (profile.typeOfSupervisorNeeded?.length ?? 0) > 0

  if (!hasContent) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">Credentials &amp; Background</h2>
      <div>
        {profile.title && (
          <Row label="Credential / Title">
            {formatCredentialWithState(profile.title, profile.licensureState)}
          </Row>
        )}
        {profile.schoolName && <Row label="School / University">{profile.schoolName}</Row>}
        {profile.degreeProgram && <Row label="Degree Program">{profile.degreeProgram}</Row>}
        {profile.expectedGraduation && (
          <Row label="Expected Graduation">{formatDate(profile.expectedGraduation)}</Row>
        )}
        {profile.clinicalHoursRequired != null && profile.clinicalHoursRequired > 0 && (
          <Row label="Clinical Hours Required">
            {profile.clinicalHoursRequired.toLocaleString('en-US')} hours
          </Row>
        )}
        {rotationWindow && <Row label="Rotation Window">{rotationWindow}</Row>}
        {occupation && (
          <Row label={isPreceptee ? 'Program / Discipline' : 'Occupation'}>{occupation}</Row>
        )}
        {specialty && <Row label={isPreceptee ? 'Rotation Focus' : 'Specialty'}>{specialty}</Row>}
        {genderIdentity && <Row label="Gender Identity">{genderIdentity}</Row>}
        {languages.length > 0 && (
          <Row label="Languages">
            <TagRow values={languages} />
          </Row>
        )}
        {supervisorTypes !== 'N/A' && (
          <Row label={isPreceptee ? 'Looking For' : 'Type of Supervisor Needed'}>
            {supervisorTypes}
          </Row>
        )}
        {statesOfLicensure.length > 0 && (
          <Row label={isPreceptee ? 'Rotation States' : 'States of Licensure'}>
            <TagRow
              values={statesOfLicensure}
              displayValues={licensureLabels}
              variant="licensure"
            />
          </Row>
        )}
        {location !== 'N/A' && <Row label="Location">{location}</Row>}
      </div>
    </section>
  )
}
