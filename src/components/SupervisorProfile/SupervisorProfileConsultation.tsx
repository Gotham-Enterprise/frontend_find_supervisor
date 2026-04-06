import { formatFeeAmount } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileConsultationProps {
  profile: SupervisorProfileData
}

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

export function SupervisorProfileConsultation({ profile }: SupervisorProfileConsultationProps) {
  const isAccepting = profile.acceptingSupervisees
  const feeType = profile.supervisionFeeType
  const feeTypeSuffix = feeType === 'HOURLY' ? 'B/hr' : feeType === 'MONTHLY' ? 'B/month' : ''
  const acceptingLabel = `${isAccepting ? 'Yes' : 'No'} for Supervision${feeTypeSuffix ? ` (${feeTypeSuffix})` : ''}`

  const feeAmount = formatFeeAmount(profile.supervisionFeeAmount, profile.supervisionFeeType)
  const location = [profile.user.city, profile.user.state].filter(Boolean).join(', ') || 'N/A'
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-3 text-base font-semibold text-[#181818]">Open For Case Consultation</h2>

      <p className="mb-3 text-sm text-[#6B7280]">{acceptingLabel}</p>

      {isAccepting && profile.supervisionFeeAmount != null && (
        <div className="mb-5 flex flex-wrap gap-2">
          <FeePill label={`${feeAmount} individual`} />
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-3">
        {location !== 'N/A' && <MetaItem label="From" value={location} />}
        <MetaItem label="Member Since" value={memberSince} />
      </div>
    </section>
  )
}
