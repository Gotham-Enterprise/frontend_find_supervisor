/**
 * Shared UI primitives used by both SupervisorDashboard and SuperviseeDashboard
 * profile sections. Keep these generic — no supervisor/supervisee-specific logic here.
 */

export { ProfileAvatar, type ProfileAvatarProps } from './ProfileAvatar'
export {
  ProfilePreviewCard,
  type ProfilePreviewCardProps,
  type ProfilePreviewStat,
} from './ProfilePreviewCard'

// ─── Profile Detail Row ───────────────────────────────────────────────────────

/**
 * A single labeled detail row — used in both supervisor and supervisee
 * profile detail cards. Renders label on the left, value on the right.
 */
export function ProfileDetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/50 py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">
        {children ?? <span className="text-muted-foreground">N/A</span>}
      </span>
    </div>
  )
}

// ─── Tag list ─────────────────────────────────────────────────────────────────

/** Renders an array of string values as small outline badge chips. */
export function TagList({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-sm text-muted-foreground">N/A</span>
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
        >
          {v}
        </span>
      ))}
    </div>
  )
}
