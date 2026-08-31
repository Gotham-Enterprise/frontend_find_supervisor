import Image from 'next/image'
import Link from 'next/link'

import { fetchPublicTopStates } from '@/lib/api/public-top-states'
import { stateAbbreviationToDisplayName, stateAbbreviationToSlug } from '@/lib/seo/routes'

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const staticColumns: FooterColumn[] = [
  {
    heading: 'By Supervisor Type',
    links: [
      {
        label: 'Mental Health Counselor Supervisors',
        href: '/supervisors?type=mental-health-counselor',
      },
      { label: 'Collaborating Physicians', href: '/supervisors?type=collaborating-physician' },
      { label: 'Supervising Physicians', href: '/supervisors?type=supervising-physician' },
      { label: 'Medical Directors', href: '/supervisors?type=medical-director' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/signup' },
      { label: 'For Supervisors', href: '/signup?type=supervisor' },
      { label: 'For Supervisees', href: '/signup?type=supervisee' },
      { label: 'For Medical Directors', href: '/signup?type=medical-director' },
      { label: 'Need a Medical Director', href: '/signup?type=need-medical-director' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
]

/**
 * Public footer (async server component). The "Find Supervisors" and
 * "Find Supervisees" state links are data-driven: the states with the most
 * publicly visible members, fetched with 1h ISR. States without any members
 * are never listed; if the data is unavailable, only the "Browse All" links
 * render.
 */
export async function PublicFooter() {
  const topStates = await fetchPublicTopStates(4)

  const supervisorLinks: FooterLink[] = [
    { label: 'Browse All Supervisors', href: '/supervisors' },
    ...topStates.supervisors.flatMap(({ state }) => {
      const slug = stateAbbreviationToSlug(state)
      if (!slug) return []
      return [
        {
          label: `Supervisors in ${stateAbbreviationToDisplayName(state)}`,
          href: `/supervisors/${slug}`,
        },
      ]
    }),
  ]

  const superviseeLinks: FooterLink[] = [
    { label: 'Browse All Supervisees', href: '/browse-supervisees' },
    ...topStates.supervisees.map(({ state }) => {
      const slug = stateAbbreviationToSlug(state)
      return {
        label: `Supervisees in ${stateAbbreviationToDisplayName(state)}`,
        href: slug ? `/browse-supervisees/${slug}` : `/browse-supervisees?state=${state}`,
      }
    }),
  ]

  const footerColumns: FooterColumn[] = [
    { heading: 'Find Supervisors', links: supervisorLinks },
    { heading: 'Find Supervisees', links: superviseeLinks },
    ...staticColumns,
  ]

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-2">
            <a
              href="https://www.gothamenterprisesltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <Image
                src="/logo.png"
                alt="Gotham Enterprises LTD"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              The leading platform for connecting healthcare professionals with Licensed
              Supervisors, Collaborating Physicians, and Supervising Physicians.
            </p>
          </div>

          {footerColumns.map(({ heading, links }) => (
            <div key={heading}>
              <p className="mb-3 text-sm font-semibold text-foreground">{heading}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            ©{new Date().getFullYear()} All Rights Reserved. Find A Supervisor is a registered
            trademark.
          </p>
        </div>
      </div>
    </footer>
  )
}
