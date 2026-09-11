import { isMedicalDirectorType } from '@/lib/utils/supervisee-eligibility'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileAboutProps {
  profile: SuperviseeProfileViewData
}

export function SuperviseeProfileAbout({ profile }: SuperviseeProfileAboutProps) {
  const introduction = profile.introduction?.trim()
  const idealDescription = profile.idealSupervisor?.trim()
  if (!introduction && !idealDescription) return null

  const neededTypes = Array.isArray(profile.typeOfSupervisorNeeded)
    ? profile.typeOfSupervisorNeeded
    : []
  const hasNonMdNeed = neededTypes.some((name) => !isMedicalDirectorType({ name }))

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">About Me</h2>
      {introduction && (
        <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
          {introduction}
        </p>
      )}
      {idealDescription && (
        <div className={introduction ? 'mt-4' : undefined}>
          {introduction && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {hasNonMdNeed ? 'Ideal Supervisor' : 'Ideal Medical Director'}
            </span>
          )}
          <p className="mt-1 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
            {idealDescription}
          </p>
        </div>
      )}
    </section>
  )
}
