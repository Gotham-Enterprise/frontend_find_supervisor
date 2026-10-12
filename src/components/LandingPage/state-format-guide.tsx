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
import { stateSlugToDisplayName, US_STATES } from '@/lib/seo/routes'

// The guide pulls in every state's rules (~250 KB), so it loads only once a
// visitor picks a state instead of weighing down the homepage.
const SupervisionFormatGuide = dynamic(
  () => import('@/components/SupervisionFormatGuide').then((m) => m.SupervisionFormatGuide),
  {
    loading: () => (
      <div
        className="h-72 animate-pulse rounded-xl border border-border bg-card"
        aria-label="Loading supervision rules"
      />
    ),
  },
)

/** Every state + DC, labelled by full name and sorted alphabetically; value is the slug. */
const STATE_OPTIONS: SelectOption[] = Object.keys(US_STATES)
  .map((slug) => ({ label: stateSlugToDisplayName(slug), value: slug }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function StateFormatGuide() {
  const [selected, setSelected] = useState<SelectOption | null>(null)

  return (
    <section id="state-rules" className="scroll-mt-16 bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Check Supervision Rules in Your State
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            See which supervision formats (In-Person, Hybrid, or Virtual) are allowed in your state
            before you choose a supervisor.
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
          <div className="space-y-6">
            <SupervisionFormatGuide
              states={[{ code: US_STATES[selected.value], name: selected.label }]}
            />
            <div className="text-center">
              <Link
                href={`/supervisors/${selected.value}`}
                className={buttonVariants({ size: 'lg' })}
              >
                Find Supervisors in {selected.label}
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <MapPinIcon className="size-8 text-primary" aria-hidden />
            <p className="max-w-md text-sm text-muted-foreground">
              Select a state to see its rules for Counselors, Social Workers, Marriage and Family
              Therapists, Psychologists, Nurse Practitioners, and Physician Assistants.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
