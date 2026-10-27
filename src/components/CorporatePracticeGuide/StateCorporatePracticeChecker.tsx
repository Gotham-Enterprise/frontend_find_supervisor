'use client'

import { ArrowRightIcon, MapPinIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import type { SelectOption } from '@/lib/api/options'
import { MEDICAL_DIRECTORS_PATH, stateSlugToDisplayName, US_STATES } from '@/lib/seo/routes'

// The card pulls in every state's CPOM entry, so it loads only once a visitor
// picks a state instead of weighing down the page.
const CorporatePracticeGuide = dynamic(
  () => import('@/components/CorporatePracticeGuide').then((m) => m.CorporatePracticeGuide),
  {
    loading: () => (
      <div
        className="h-40 animate-pulse rounded-xl border border-border bg-card"
        aria-label="Loading ownership rules"
      />
    ),
  },
)

/** Every state + DC, labelled by full name and sorted alphabetically; value is the slug. */
const STATE_OPTIONS: SelectOption[] = Object.keys(US_STATES)
  .map((slug) => ({ label: stateSlugToDisplayName(slug), value: slug }))
  .sort((a, b) => a.label.localeCompare(b.label))

/**
 * "Check Ownership Rules in Your State" picker for the /medical-directors index:
 * pick a state to see its Corporate Practice of Medicine card, then jump to
 * that state's Medical Directors. Mirrors the homepage supervision-rules picker.
 */
export function StateCorporatePracticeChecker() {
  const [selected, setSelected] = useState<SelectOption | null>(null)

  return (
    <section
      aria-labelledby="ownership-rules-heading"
      className="rounded-2xl bg-muted/40 p-6 sm:p-8"
    >
      <div className="mb-6 text-center">
        <h2 id="ownership-rules-heading" className="text-2xl font-bold text-foreground">
          Check Ownership Rules in Your State
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          See whether a non-physician can own a med spa or clinic and hire a Medical Director in
          your state under its Corporate Practice of Medicine rules.
        </p>
      </div>

      <div className="mx-auto mb-6 max-w-sm">
        <Combobox
          items={STATE_OPTIONS}
          value={selected}
          onValueChange={(item: SelectOption | null) => setSelected(item)}
          isItemEqualToValue={(a, b) => a?.value === b?.value}
        >
          <ComboboxTrigger aria-label="Select your state">
            <ComboboxValue placeholder="Select your state…" />
          </ComboboxTrigger>
          <ComboboxContent searchPlaceholder="Search states…">
            {(item: SelectOption) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxContent>
        </Combobox>
      </div>

      {selected ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <CorporatePracticeGuide
            stateCode={US_STATES[selected.value]}
            stateName={selected.label}
          />
          <div className="text-center">
            <Link
              href={`${MEDICAL_DIRECTORS_PATH}/${selected.value}`}
              className={buttonVariants({ size: 'lg' })}
            >
              Find Medical Directors in {selected.label}
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <MapPinIcon className="size-8 text-primary" aria-hidden />
          <p className="max-w-md text-sm text-muted-foreground">
            Select a state to see whether its rules are strict, have exceptions, or have few
            restrictions, with a link to the source.
          </p>
        </div>
      )}
    </section>
  )
}
