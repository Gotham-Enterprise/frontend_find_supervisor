import { EyeOffIcon, LanguagesIcon, UserRoundIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { OwnIdentityBlock, OwnIdentitySummary } from '@/lib/utils/identity-display'

/**
 * The owner's pronouns beside their name on the dashboard card. Shows what
 * they entered even while hidden, with a small marker so they know it is
 * not on their public profile.
 */
export function OwnPronouns({ block }: { block: OwnIdentityBlock | null }) {
  if (!block) return null
  return (
    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
      ({block.text}){!block.isPublic && <PrivateMarker />}
    </span>
  )
}

/** Gender identity and languages lines under the location on the dashboard card. */
export function OwnIdentityDetails({ summary }: { summary: OwnIdentitySummary }) {
  const { genderIdentity, languages } = summary
  if (!genderIdentity && !languages) return null
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {genderIdentity && (
        <DetailLine
          icon={<UserRoundIcon className="size-3.5 shrink-0" aria-hidden />}
          block={genderIdentity}
        >
          <span className="sr-only">Gender identity: </span>
        </DetailLine>
      )}
      {languages && (
        <DetailLine
          icon={<LanguagesIcon className="size-3.5 shrink-0" aria-hidden />}
          block={languages}
        >
          <span className="sr-only">Languages: </span>
        </DetailLine>
      )}
    </div>
  )
}

function DetailLine({
  icon,
  block,
  children,
}: {
  icon: ReactNode
  block: OwnIdentityBlock
  children?: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {children}
      {block.text}
      {!block.isPublic && <PrivateMarker />}
    </span>
  )
}

/** Marks a value that is stored but not shown on the public profile. */
function PrivateMarker() {
  return (
    <span
      className="ml-1 inline-flex items-center gap-0.5 rounded bg-muted px-1 py-px text-[10px] font-medium text-muted-foreground"
      title="Not shown on your public profile"
    >
      <EyeOffIcon className="size-2.5" aria-hidden />
      Private
    </span>
  )
}
