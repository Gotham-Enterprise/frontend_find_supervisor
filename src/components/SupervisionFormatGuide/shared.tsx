import { AlertTriangleIcon, CheckIcon, CircleHelpIcon, InfoIcon, XIcon } from 'lucide-react'

/** Visual tone shared by the state guide cards. */
export type GuideTone = 'good' | 'caution' | 'bad' | 'unknown' | 'neutral'

export const GUIDE_TONE_STYLES: Record<GuideTone, { className: string; Icon: typeof CheckIcon }> = {
  good: { className: 'bg-emerald-50 text-emerald-700 border-emerald-100', Icon: CheckIcon },
  caution: { className: 'bg-amber-50 text-amber-800 border-amber-200', Icon: AlertTriangleIcon },
  bad: { className: 'bg-destructive/10 text-destructive border-destructive/20', Icon: XIcon },
  unknown: { className: 'bg-muted text-muted-foreground border-border', Icon: CircleHelpIcon },
  neutral: { className: 'bg-card text-foreground border-border', Icon: InfoIcon },
}

function formatVerifiedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

/** Oldest verification date across the entries a card shows. */
export function oldestVerifiedDate(entries: { lastVerified: string }[]): string {
  return entries.map((e) => e.lastVerified).sort()[0]
}

export function GuideDisclaimer({ lastVerified }: { lastVerified: string }) {
  return (
    <p className="text-[11px] text-muted-foreground">
      For guidance only, not legal advice. Rules change, so confirm with your state board. Last
      verified {formatVerifiedDate(lastVerified)}.
    </p>
  )
}
