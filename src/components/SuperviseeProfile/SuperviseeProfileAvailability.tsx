import type { SelectOption } from '@/lib/api/options'
import { formatSupervisionFormat, resolveOptionLabel } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileAvailabilityProps {
  profile: SuperviseeProfileViewData
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

export function SuperviseeProfileAvailability({
  profile,
  availabilityOptions,
}: SuperviseeProfileAvailabilityProps) {
  const availabilityLabel = resolveOptionLabel(profile.availability, availabilityOptions)
  const formatLabel = formatSupervisionFormat(profile.preferredFormat)

  const hasAnyContent = profile.preferredFormat || profile.availability

  if (!hasAnyContent) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-2 text-base font-semibold text-[#181818]">
        Availability &amp; Preferences
      </h2>
      <div>
        {profile.preferredFormat && <Row label="Supervision Format">{formatLabel}</Row>}
        {profile.availability && <Row label="Availability">{availabilityLabel}</Row>}
      </div>
    </section>
  )
}
