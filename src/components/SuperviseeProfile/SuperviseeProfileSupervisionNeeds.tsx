import { formatBudgetRange, formatHowSoonLooking } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

function FeePill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-sm text-[#374151]">
      <span className="size-1.5 rounded-full bg-[#006D36]" />
      {label}
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </span>
      <span className="text-sm text-[#181818]">{value}</span>
    </div>
  )
}

interface SuperviseeProfileSupervisionNeedsProps {
  profile: SuperviseeProfileViewData
}

export function SuperviseeProfileSupervisionNeeds({
  profile,
}: SuperviseeProfileSupervisionNeedsProps) {
  const howSoonLabel = formatHowSoonLooking(profile.howSoonLooking, profile.lookingDate)
  const budgetLabel = formatBudgetRange(
    profile.budgetRangeStart,
    profile.budgetRangeEnd,
    profile.budgetRangeType,
  )
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A'

  const hasBudget = profile.budgetRangeStart != null || profile.budgetRangeEnd != null
  const hasContent = profile.howSoonLooking || hasBudget || profile.createdAt

  if (!hasContent) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-3 text-base font-semibold text-[#181818]">Supervision Needs</h2>

      {hasBudget && budgetLabel !== 'N/A' && (
        <div className="mb-5 flex flex-wrap gap-2">
          <FeePill label={`Budget: ${budgetLabel}`} />
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-3">
        {howSoonLabel !== 'N/A' && <MetaItem label="How Soon" value={howSoonLabel} />}
        <MetaItem label="Member Since" value={memberSince} />
      </div>
    </section>
  )
}
