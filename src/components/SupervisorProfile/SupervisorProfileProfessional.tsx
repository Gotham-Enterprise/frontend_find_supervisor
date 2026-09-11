import type { SelectOption } from '@/lib/api/options'
import {
  formatDate,
  formatSupervisorTypeLabel,
  formatSupervisorTypeWithOfferings,
  resolveOptionLabels,
} from '@/lib/utils/profile-formatters'
import {
  getSupervisorCredentialTypeLabel,
  getSupervisorDisplayCredential,
} from '@/lib/utils/supervisor-type'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileProfessionalProps {
  profile: SupervisorProfileData
  certificationOptions: SelectOption[]
  patientPopulationOptions: SelectOption[]
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
  stateOptions,
}: SupervisorProfileProfessionalProps) {
  const certLabels = resolveOptionLabels(profile.certification ?? [], certificationOptions)
  const popLabels = resolveOptionLabels(profile.patientPopulation ?? [], patientPopulationOptions)
  // License rows carry their own states; user.stateOfLicensure stays the
  // superset for legacy records whose extra states have no license row yet.
  const licenses = (profile.licenses ?? []).filter((license) => license.state?.trim())
  const licenseStates = [...new Set(licenses.map((license) => license.state as string))]
  const statesOfLicensure =
    licenseStates.length > 0
      ? [...new Set([...licenseStates, ...(profile.user.stateOfLicensure ?? [])])]
      : (profile.user.stateOfLicensure ?? [])
  const licensureLabels = resolveOptionLabels(statesOfLicensure, stateOptions)
  const credentialLabel = getSupervisorCredentialTypeLabel(profile.supervisorType ?? '')
  const credentialValue = getSupervisorDisplayCredential(profile)
  const stateLabel = (state: string) =>
    stateOptions.find((option) => option.value === state)?.label ?? state
  // Medical Director extras — empty for other supervisor types.
  const offerings = profile.offerings ?? []
  const boardCertifications = profile.boardCertifications ?? []

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">License &amp; Credentials</h2>
      <div>
        {credentialValue && <Row label={credentialLabel}>{credentialValue}</Row>}
        {profile.supervisorType && (
          <Row label="Supervisor Type">
            {formatSupervisorTypeWithOfferings(profile.supervisorType, offerings)}
          </Row>
        )}
        {statesOfLicensure.length > 0 && (
          <Row label="States of Licensure">
            <TagRow
              values={statesOfLicensure}
              displayValues={licensureLabels}
              variant="licensure"
            />
          </Row>
        )}
        {licenses.length > 0 ? (
          <Row label={licenses.length === 1 ? 'License' : 'Licenses'}>
            <span className="flex flex-col items-end gap-1">
              {licenses.map((license, index) => (
                <span key={license.id ?? index}>
                  {[
                    license.licenseType ?? getSupervisorDisplayCredential(profile),
                    stateLabel(license.state as string),
                    license.licenseNumber ? `#${license.licenseNumber}` : null,
                    license.licenseExpiration
                      ? `expires ${formatDate(license.licenseExpiration)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              ))}
            </span>
          </Row>
        ) : (
          profile.licenseExpiration && (
            <Row label="License Expiration">{formatDate(profile.licenseExpiration)}</Row>
          )
        )}
        {boardCertifications.length > 0 && (
          <Row
            label={
              boardCertifications.length === 1 ? 'Board Certification' : 'Board Certifications'
            }
          >
            <span className="flex flex-col items-end gap-1">
              {boardCertifications.map((certification, index) => (
                <span key={certification.id ?? index}>
                  {[
                    certification.certifyingBoard,
                    [certification.specialty, certification.subspecialty]
                      .filter(Boolean)
                      .join(' — '),
                    // Redacted (null) for non-owner viewers
                    certification.certificationNumber
                      ? `#${certification.certificationNumber}`
                      : null,
                    certification.expirationDate
                      ? `valid through ${formatDate(certification.expirationDate)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              ))}
            </span>
          </Row>
        )}
        {/* Medical Director secondary offerings — one row per offered service,
            each with its own credentials and license entries */}
        {offerings.map((offering, offeringIndex) => (
          <Row
            key={offering.id ?? offeringIndex}
            label={`Offered as ${formatSupervisorTypeLabel(offering.supervisorType)}`}
          >
            <span className="flex flex-col items-end gap-1">
              <span>
                {[offering.occupation, offering.specialty, offering.degreeType]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </span>
              {(offering.licenses ?? [])
                .filter((license) => license.state?.trim())
                .map((license, index) => (
                  <span key={license.id ?? index}>
                    {[
                      stateLabel(license.state as string),
                      license.licenseNumber ? `#${license.licenseNumber}` : null,
                      license.licenseExpiration
                        ? `expires ${formatDate(license.licenseExpiration)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ))}
            </span>
          </Row>
        ))}
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
