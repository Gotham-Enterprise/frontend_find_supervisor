import { LockIcon, PhoneIcon } from 'lucide-react'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import { useSuperviseeProfile } from '@/lib/hooks/useSuperviseeProfile'
import { formatContactNumber } from '@/lib/utils/profile-formatters'
import { hasActivePaidSupervisionSubscription } from '@/lib/utils/subscription-plan-resolution'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileContactProps {
  profile: SupervisorProfileData
}

export function SupervisorProfileContact({ profile }: SupervisorProfileContactProps) {
  const { user } = useUser()
  const {
    data: superviseeProfile,
    isPending: superviseeProfileLoading,
    isError: superviseeProfileError,
  } = useSuperviseeProfile()
  const { contactNumber } = profile.user

  /** JWT `permissions` can lag after checkout; GET supervisee/profile is authoritative for subscription. */
  const subscribedPerProfile =
    isSuperviseeRole(user?.role) &&
    !superviseeProfileLoading &&
    !superviseeProfileError &&
    hasActivePaidSupervisionSubscription(superviseeProfile?.user.subscriptions)

  const canSeeContact =
    (user?.permissions?.isSupervisorContactDetailsVisible ?? false) || subscribedPerProfile

  // Nothing to show if there's no contact number at all
  if (!contactNumber) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Contact</h2>

      {canSeeContact ? (
        <div className="flex items-center gap-2 text-sm text-[#374151]">
          <PhoneIcon className="size-4 shrink-0 text-[#6B7280]" />
          <span>{formatContactNumber(contactNumber)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] px-4 py-3 text-sm text-[#6B7280]">
          <LockIcon className="size-4 shrink-0" />
          <span>Contact details are visible to subscribed supervisees.</span>
        </div>
      )}
    </section>
  )
}
