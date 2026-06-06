import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileAboutProps {
  profile: SuperviseeProfileViewData
}

export function SuperviseeProfileAbout({ profile }: SuperviseeProfileAboutProps) {
  const text = profile.idealSupervisor?.trim()
  if (!text) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">About Me</h2>
      <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{text}</p>
    </section>
  )
}
