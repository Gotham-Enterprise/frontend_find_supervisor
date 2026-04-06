import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileAboutProps {
  profile: SupervisorProfileData
}

export function SupervisorProfileAbout({ profile }: SupervisorProfileAboutProps) {
  const hasSummary = !!profile.professionalSummary?.trim()
  const hasDescription = !!profile.describeYourself?.trim()

  if (!hasSummary && !hasDescription) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">About Me</h2>
      <div className="space-y-4">
        {hasSummary && (
          <p className="max-w-2xl text-sm leading-relaxed text-[#374151]">
            {profile.professionalSummary}
          </p>
        )}
        {hasDescription && (
          <p className="max-w-2xl text-sm leading-relaxed text-[#374151]">
            {profile.describeYourself}
          </p>
        )}
      </div>
    </section>
  )
}
