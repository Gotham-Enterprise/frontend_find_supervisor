import { CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

// ─── Data ──────────────────────────────────────────────────────────────────────

const GOOD_EXAMPLES = [
  { src: '/profile-examples/pe-gp-1.png', caption: 'Facing camera' },
  { src: '/profile-examples/pe-gp-2.png', caption: 'Good lighting' },
  { src: '/profile-examples/pe-gp-3.png', caption: 'Not blurry' },
  { src: '/profile-examples/pe-gp-4.png', caption: 'Not a selfie' },
] as const

const BAD_EXAMPLES = [
  { src: '/profile-examples/pe-bp-1.png', caption: 'Looking away' },
  { src: '/profile-examples/pe-bp-2.png', caption: 'Blurry' },
  { src: '/profile-examples/pe-bp-3.png', caption: 'Poor lighting' },
  { src: '/profile-examples/pe-bp-4.png', caption: 'Black & White' },
] as const

// ─── Example thumbnail ──────────────────────────────────────────────────────────

function ExampleThumbnail({ src, variant }: { src: string; variant: 'good' | 'bad' }) {
  return (
    <div
      className={cn(
        'flex size-12 flex-shrink-0 overflow-hidden rounded-full border-2 object-cover',
        variant === 'good' ? 'border-emerald-300' : 'border-red-300',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
    </div>
  )
}

// ─── Guideline card ────────────────────────────────────────────────────────────

type GuidelineCardProps = {
  variant: 'good' | 'bad'
  title: string
  items: ReadonlyArray<{ src: string; caption: string }>
}

function GuidelineCard({ variant, title, items }: GuidelineCardProps) {
  const isGood = variant === 'good'

  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-3 rounded-xl border p-4',
        isGood ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
      )}
    >
      {/* Card header */}
      <div className="flex items-center gap-2">
        {isGood ? (
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <XCircle className="size-5 shrink-0 text-red-500" aria-hidden />
        )}
        <span className={cn('text-sm font-semibold', isGood ? 'text-emerald-800' : 'text-red-800')}>
          {title}
        </span>
      </div>

      {/* Example grid */}
      <div className="flex gap-2">
        {items.map((item) => (
          <div key={item.caption} className="flex flex-1 flex-col items-center gap-1.5">
            <ExampleThumbnail src={item.src} variant={variant} />
            <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground">
              {item.caption}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Public component ──────────────────────────────────────────────────────────

/**
 * Renders the "Example of good photo" / "Example of bad photo" panels shown
 * at the bottom of the Profile Photo upload modal.
 *
 * Uses example images from public/profile-examples/ (pe-gp-*.png, pe-bp-*.png).
 */
export function PhotoGuidelines() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <GuidelineCard variant="good" title="Example of good photo" items={GOOD_EXAMPLES} />
      <GuidelineCard variant="bad" title="Example of bad photo" items={BAD_EXAMPLES} />
    </div>
  )
}
