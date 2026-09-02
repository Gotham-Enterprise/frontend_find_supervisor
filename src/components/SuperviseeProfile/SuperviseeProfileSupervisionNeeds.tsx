import { formatBudgetRange, formatHowSoonLooking } from '@/lib/utils/profile-formatters'
import {
  isMedicalDirectorType,
  supervisionTypeDisplayLabel,
} from '@/lib/utils/supervisee-eligibility'
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
  const neededTypes = Array.isArray(profile.typeOfSupervisorNeeded)
    ? profile.typeOfSupervisorNeeded
    : []
  const hasMdNeed = neededTypes.some((name) => isMedicalDirectorType({ name }))
  const hasNonMdNeed = neededTypes.some((name) => !isMedicalDirectorType({ name }))
  const neededRoleLabels = neededTypes.map(supervisionTypeDisplayLabel)

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

  const mdHowSoonLabel = formatHowSoonLooking(profile.mdHowSoonLooking, profile.mdLookingDate)
  const hasMdBudget = profile.mdMonthlyBudget != null && profile.mdMonthlyBudget > 0
  // MD-only signups copy the About description into mdIdealDescription — skip the duplicate
  const mdIdealDescription =
    profile.mdIdealDescription && profile.mdIdealDescription !== profile.idealSupervisor
      ? profile.mdIdealDescription
      : ''

  const hasContent =
    neededTypes.length > 0 || profile.howSoonLooking || hasBudget || hasMdNeed || profile.createdAt

  if (!hasContent) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-3 text-base font-semibold text-[#181818]">
        {hasNonMdNeed ? 'Supervision Needs' : 'Medical Director Needs'}
      </h2>

      {neededRoleLabels.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {neededRoleLabels.map((label) => (
            <FeePill key={label} label={label} />
          ))}
        </div>
      )}

      {hasNonMdNeed && hasBudget && budgetLabel !== 'N/A' && (
        <div className="mb-5 flex flex-wrap gap-2">
          <FeePill label={`Budget: ${budgetLabel}`} />
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-3">
        {hasNonMdNeed && howSoonLabel !== 'N/A' && (
          <MetaItem label="How Soon" value={howSoonLabel} />
        )}
        <MetaItem label="Member Since" value={memberSince} />
      </div>

      {/* Medical Director need — its own preference block (md* fields) */}
      {hasMdNeed && (
        <div className="mt-6">
          {hasNonMdNeed && (
            <h3 className="mb-3 text-sm font-semibold text-[#181818]">Medical Director</h3>
          )}
          {hasMdBudget && (
            <div className="mb-4 flex flex-wrap gap-2">
              <FeePill label={`Monthly Budget: $${profile.mdMonthlyBudget} /month`} />
            </div>
          )}
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {mdHowSoonLabel !== 'N/A' && <MetaItem label="How Soon" value={mdHowSoonLabel} />}
            {profile.mdPreferredOccupation && (
              <MetaItem label="Preferred Occupation" value={profile.mdPreferredOccupation} />
            )}
            {profile.mdPreferredSpecialty && (
              <MetaItem label="Preferred Specialty" value={profile.mdPreferredSpecialty} />
            )}
          </div>
          {mdIdealDescription && (
            <div className="mt-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Ideal Medical Director
              </span>
              <p className="mt-1 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
                {mdIdealDescription}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
