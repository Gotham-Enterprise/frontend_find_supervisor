import { ExternalLinkIcon } from 'lucide-react'

import type { SelectOption } from '@/lib/api/options'
import { formatSupervisionFormat, resolveOptionLabel } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfilePracticeProps {
  profile: SupervisorProfileData
  availabilityOptions: SelectOption[]
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-[#F3F4F6] py-3 last:border-0">
      <span className="shrink-0 text-sm font-medium text-[#181818]">{label}</span>
      <span className="text-right text-sm text-[#6B7280]">{children}</span>
    </div>
  )
}

export function SupervisorProfilePractice({
  profile,
  availabilityOptions,
}: SupervisorProfilePracticeProps) {
  const availabilityLabel = resolveOptionLabel(profile.availability, availabilityOptions)
  const formatLabel = formatSupervisionFormat(profile.supervisionFormat)

  const hasAnyContent = profile.supervisionFormat || profile.availability || profile.website

  if (!hasAnyContent) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">Practice &amp; Availability</h2>
      <div>
        {profile.supervisionFormat && <Row label="Supervision Format">{formatLabel}</Row>}
        {profile.availability && <Row label="Availability">{availabilityLabel}</Row>}
        {profile.website && (
          <Row label="Website">
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#006D36] hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, '')}
              <ExternalLinkIcon className="size-3 shrink-0" />
            </a>
          </Row>
        )}
      </div>
    </section>
  )
}
