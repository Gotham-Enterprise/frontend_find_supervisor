import { CheckCircle2, Clock, Lock } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const PREMIUM_PRICE = 99

const PREMIUM_FEATURES = [
  'View supervisor contact details',
  'Direct messaging with supervisors',
  'Enhanced communication tools',
  'Priority supervisor matching',
  'Session scheduling tools',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function PremiumBadge() {
  return (
    <span className="inline-flex w-fit shrink-0 items-center self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
      Premium
    </span>
  )
}

function PricingRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-sm font-semibold text-white' : 'text-sm text-white/55'}>
        {label}
      </span>
      <span className={bold ? 'text-sm font-bold text-white' : 'text-sm text-white/75'}>
        {value}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutSummaryPanel() {
  return (
    <aside className="flex flex-col gap-8 bg-[#008542] px-8 py-12 lg:w-[420px] lg:shrink-0">
      {/* Plan header */}
      <div className="flex flex-col gap-3">
        <PremiumBadge />
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              ${PREMIUM_PRICE}
            </span>
            <span className="text-lg text-white/55">/month</span>
          </div>
          <p className="mt-1.5 text-sm text-white/55">Billed monthly · Cancel anytime</p>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Feature list */}
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
          What&apos;s included
        </p>
        <ul className="space-y-3">
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckCircle2 className="size-3 text-white" />
              </div>
              <span className="text-sm text-white/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-white/10" />

      {/* Pricing breakdown */}
      <div className="space-y-3">
        <PricingRow label="Subtotal" value={`$${PREMIUM_PRICE}.00`} />
        <PricingRow label="Tax" value="$0.00" />
        <div className="h-px bg-white/10" />
        <PricingRow label="Total due today" value={`$${PREMIUM_PRICE}.00`} bold />
      </div>

      {/* Bottom trust notes */}
      <div className="mt-auto space-y-2.5 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 shrink-0 text-white/40" />
          <span className="text-xs text-white/45">256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-white/40" />
          <span className="text-xs text-white/45">Cancel or change your plan anytime</span>
        </div>
      </div>
    </aside>
  )
}
