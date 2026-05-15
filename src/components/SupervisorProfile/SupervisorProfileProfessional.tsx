import type { SelectOption } from '@/lib/api/options'
import { formatDate, resolveOptionLabel, resolveOptionLabels } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileProfessionalProps {
  profile: SupervisorProfileData
  certificationOptions: SelectOption[]
  patientPopulationOptions: SelectOption[]
  licenseTypeOptions: SelectOption[]
  /** US state options (abbreviation → label); from {@link useStatesOptions}. */
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
  /** When set (same length as `values`), shown instead of raw `values` (e.g. full state names). */
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

export function SupervisorProfileProfessional({
  profile,
  certificationOptions,
  patientPopulationOptions,
  licenseTypeOptions,
  stateOptions,
}: SupervisorProfileProfessionalProps) {
  const licenseTypeLabel = resolveOptionLabel(profile.licenseType, licenseTypeOptions)
  const certLabels = resolveOptionLabels(profile.certification ?? [], certificationOptions)
  const popLabels = resolveOptionLabels(profile.patientPopulation ?? [], patientPopulationOptions)
  const statesOfLicensure = profile.user.stateOfLicensure ?? []
  const licensureLabels = resolveOptionLabels(statesOfLicensure, stateOptions)

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">License &amp; Credentials</h2>
      <div>
        {profile.licenseType && <Row label="License Type">{licenseTypeLabel}</Row>}
        {statesOfLicensure.length > 0 && (
          <Row label="States of Licensure">
            <TagRow
              values={statesOfLicensure}
              displayValues={licensureLabels}
              variant="licensure"
            />
          </Row>
        )}
        {profile.licenseExpiration && (
          <Row label="License Expiration">{formatDate(profile.licenseExpiration)}</Row>
        )}
        {profile.yearsOfExperience && (
          <Row label="Years of Experience">{profile.yearsOfExperience}</Row>
        )}
        {certLabels.length > 0 && (
          <Row label="Certifications">
            <TagRow values={certLabels} />
          </Row>
        )}
        {popLabels.length > 0 && (
          <Row label="Patient Population">
            <TagRow values={popLabels} />
          </Row>
        )}
      </div>
    </section>
  )
}
