import Link from 'next/link'

import { isPublicMedicalDirector, type PublicSupervisorSummary } from '@/lib/api/public-supervisors'
import { stateAbbreviationToDisplayName } from '@/lib/seo/routes'
import { formatPublicIdentity } from '@/lib/utils/identity-display'
import {
  formatDate,
  formatFeeAmount,
  formatFeeType,
  formatNameWithCredentials,
  getSupervisorTypeDisplayLabels,
} from '@/lib/utils/profile-formatters'

interface SupervisorPublicProfileProps {
  supervisor: PublicSupervisorSummary
  /** In-app page guests land on after signing in, e.g. /find-supervisors/<id>. */
  connectPath: string
  /** Signup URL for the "Create free account" CTA. */
  signupHref?: string
}

/**
 * Public (guest) profile card shared by /supervisors/[state]/[id] and
 * /medical-directors/[state]/[id]. Server Component — no auth dependencies.
 */
export function SupervisorPublicProfile({
  supervisor,
  connectPath,
  signupHref = '/signup',
}: SupervisorPublicProfileProps) {
  const isMedicalDirector = isPublicMedicalDirector(supervisor)
  const location = [supervisor.city, supervisor.state].filter(Boolean).join(', ')
  // Medical Directors show every role they cover (primary + offerings).
  const roleTags = isMedicalDirector
    ? getSupervisorTypeDisplayLabels('Medical Director', supervisor.offerings)
    : [supervisor.supervisorType]
  const tags = [...new Set([supervisor.licenseType, ...roleTags, supervisor.supervisionFormat])]
    .filter(Boolean)
    .map((tag) => (tag === supervisor.supervisionFormat ? formatEnum(tag) : tag))
  // The public endpoint already strips the blocks the supervisor kept private.
  const { pronouns, genderIdentity, languages } = formatPublicIdentity(supervisor)

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Hero */}
      <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        {supervisor.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supervisor.profilePhotoUrl}
            alt={`${supervisor.fullName} profile photo`}
            className="size-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-2xl font-semibold text-[#006D36]"
            aria-hidden="true"
          >
            {initials(supervisor.fullName)}
          </div>
        )}

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {formatNameWithCredentials(supervisor.fullName, supervisor.professionalCredentials)}
            {pronouns && (
              <span className="ml-2 text-base font-normal text-muted-foreground">({pronouns})</span>
            )}
          </h1>
          {location && <p className="mt-0.5 text-sm text-muted-foreground">{location}</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {supervisor.acceptingSupervisees && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
                {isMedicalDirector ? 'Accepting new clients' : 'Accepting supervisees'}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {supervisor.yearsOfExperience && (
          <ProfileDetail label="Years of Experience" value={supervisor.yearsOfExperience} />
        )}
        {supervisor.licenseType && (
          <ProfileDetail
            label={isMedicalDirector ? 'Degree' : 'License Type'}
            value={supervisor.licenseType}
          />
        )}
        {supervisor.supervisionFormat && (
          <ProfileDetail
            label={isMedicalDirector ? 'Format' : 'Supervision Format'}
            value={formatEnum(supervisor.supervisionFormat)}
          />
        )}
        {supervisor.specialty && <ProfileDetail label="Specialty" value={supervisor.specialty} />}
        {genderIdentity && <ProfileDetail label="Gender Identity" value={genderIdentity} />}
        {languages.length > 0 && <ProfileDetail label="Languages" value={languages.join(', ')} />}
      </div>

      {/* Bio — professionalSummary if set, otherwise describeYourself */}
      {supervisor.bio && (
        <div className="border-t px-6 pb-6 pt-4">
          <h2 className="text-sm font-semibold text-foreground">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{supervisor.bio}</p>
        </div>
      )}

      {/* Licensed in */}
      {supervisor.stateOfLicensure.length > 0 && (
        <div className="border-t bg-[#F0F7F3] px-6 py-5">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4 shrink-0 text-[#006D36]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm font-semibold text-[#006D36]">
              Licensed in {supervisor.stateOfLicensure.length} state
              {supervisor.stateOfLicensure.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {supervisor.stateOfLicensure.map((s) => (
              <span
                key={s}
                className="rounded-md border border-[#006D36]/20 bg-white px-3 py-1 text-sm font-semibold text-[#006D36]"
              >
                {stateAbbreviationToDisplayName(s)}{' '}
                <span className="font-normal opacity-70">({s.toUpperCase()})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Board certifications (Medical Directors) — numbers are never public */}
      {supervisor.boardCertifications.length > 0 && (
        <div className="border-t px-6 pb-6 pt-4">
          <h2 className="text-sm font-semibold text-foreground">
            {supervisor.boardCertifications.length === 1
              ? 'Board Certification'
              : 'Board Certifications'}
          </h2>
          <ul className="mt-2 space-y-1.5">
            {supervisor.boardCertifications.map((certification, index) => (
              <li key={`${certification.certifyingBoard}-${index}`} className="text-sm">
                <span className="font-medium text-foreground">{certification.certifyingBoard}</span>
                {certification.specialty && (
                  <span className="text-muted-foreground">
                    {' · '}
                    {certification.specialty}
                    {certification.subspecialty && ` (${certification.subspecialty})`}
                  </span>
                )}
                {certification.expirationDate && (
                  <span className="text-muted-foreground">
                    {' · '}valid through {formatDate(certification.expirationDate)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Other physician roles a Medical Director offers */}
      {supervisor.offerings.length > 0 && (
        <div className="border-t px-6 pb-6 pt-4">
          <h2 className="text-sm font-semibold text-foreground">Also Available As</h2>
          <ul className="mt-2 space-y-1.5">
            {supervisor.offerings.map((offering) => (
              <li key={offering.supervisorType} className="text-sm">
                <span className="font-medium text-foreground">{offering.supervisorType}</span>
                {(offering.specialty || offering.licenseStates.length > 0) && (
                  <span className="text-muted-foreground">
                    {offering.specialty && ` · ${offering.specialty}`}
                    {offering.licenseStates.length > 0 &&
                      ` · Licensed in ${offering.licenseStates.join(', ')}`}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rate */}
      {supervisor.supervisionFeeAmount != null && (
        <div className="grid gap-4 border-t p-6 sm:grid-cols-2">
          {supervisor.supervisionFeeType && (
            <ProfileDetail label="Rate Type" value={formatFeeType(supervisor.supervisionFeeType)} />
          )}
          <ProfileDetail
            label="Rate"
            value={formatFeeAmount(supervisor.supervisionFeeAmount, supervisor.supervisionFeeType)}
          />
        </div>
      )}

      {/* Certifications */}
      {supervisor.certification.length > 0 && (
        <div className="border-t px-6 pb-6 pt-4">
          <h2 className="text-sm font-semibold text-foreground">Certifications & Approaches</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {supervisor.certification.map((c) => (
              <span
                key={c}
                className="rounded-md border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {formatCertification(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA — sign-in required only to contact or hire */}
      <div className="border-t bg-muted/30 px-6 py-5">
        <p className="text-sm text-muted-foreground">
          Ready to connect? Sign in or create a free account to contact {supervisor.fullName} and
          send a hire request.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/login?redirect=${connectPath}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in to connect
          </Link>
          <Link
            href={signupHref}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function formatEnum(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const KNOWN_ACRONYMS = new Set([
  'ACT',
  'CBT',
  'DBT',
  'EMDR',
  'EFT',
  'IFS',
  'REBT',
  'SFBT',
  'CPT',
  'PE',
  'MBSR',
  'MBCT',
  'ABA',
  'CRT',
  'TF',
  'PCIT',
  'MI',
  'AEDP',
  'ISTDP',
  'RET',
  'CSAT',
  'NLP',
])

function formatCertification(value: string): string {
  return value
    .split('_')
    .map((word) =>
      KNOWN_ACRONYMS.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
