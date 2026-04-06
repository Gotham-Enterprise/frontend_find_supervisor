import { FileTextIcon } from 'lucide-react'

import type { SelectOption } from '@/lib/api/options'
import { formatDate, resolveOptionLabel, resolveOptionLabels } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileProfessionalProps {
  profile: SupervisorProfileData
  certificationOptions: SelectOption[]
  patientPopulationOptions: SelectOption[]
  licenseTypeOptions: SelectOption[]
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-[#F3F4F6] py-3 last:border-0">
      <span className="shrink-0 text-sm font-medium text-[#181818]">{label}</span>
      <span className="text-right text-sm text-[#6B7280]">{children}</span>
    </div>
  )
}

function TagRow({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-sm text-[#6B7280]">N/A</span>
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-xs text-[#374151]"
        >
          {v}
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
}: SupervisorProfileProfessionalProps) {
  const licenseTypeLabel = resolveOptionLabel(profile.licenseType, licenseTypeOptions)
  const certLabels = resolveOptionLabels(profile.certification ?? [], certificationOptions)
  const popLabels = resolveOptionLabels(profile.patientPopulation ?? [], patientPopulationOptions)
  const statesOfLicensure = profile.user.stateOfLicensure ?? []

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">License &amp; Credentials</h2>
      <div>
        {profile.licenseType && <Row label="License Type">{licenseTypeLabel}</Row>}
        {profile.licenseNumber && <Row label="License Number">{profile.licenseNumber}</Row>}
        {statesOfLicensure.length > 0 && (
          <Row label="States of Licensure">
            <TagRow values={statesOfLicensure} />
          </Row>
        )}
        {profile.licenseExpiration && (
          <Row label="License Expiration">{formatDate(profile.licenseExpiration)}</Row>
        )}
        {profile.npiNumber && <Row label="NPI Number">{profile.npiNumber}</Row>}
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
        {profile.licenseFileName && profile.licenseUrl && (
          <Row label="License Document">
            <a
              href={profile.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#006D36] hover:underline"
            >
              <FileTextIcon className="size-3.5 shrink-0" />
              {profile.licenseFileName}
            </a>
          </Row>
        )}
      </div>
    </section>
  )
}
