import Image from 'next/image'
import Link from 'next/link'

const footerColumns = [
  {
    heading: 'Find Supervisors',
    links: [
      { label: 'Browse All Supervisors', href: '/supervisors' },
      { label: 'Supervisors in California', href: '/supervisors/california' },
      { label: 'Supervisors in Texas', href: '/supervisors/texas' },
      { label: 'Supervisors in Florida', href: '/supervisors/florida' },
      { label: 'Supervisors in New York', href: '/supervisors/new-york' },
    ],
  },
  {
    heading: 'By Supervisor Type',
    links: [
      {
        label: 'Mental Health Counselor Supervisors',
        href: '/supervisors?type=mental-health-counselor',
      },
      { label: 'Collaborating Physicians', href: '/supervisors?type=collaborating-physician' },
      { label: 'Supervising Physicians', href: '/supervisors?type=supervising-physician' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/signup' },
      { label: 'For Supervisors', href: '/signup' },
      { label: 'For Supervisees', href: '/signup' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Terms & Conditions', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <Image
                src="/logo.png"
                alt="Find A Supervisor"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The leading platform for connecting healthcare professionals with licensed
              supervisors, collaborating physicians, and supervising physicians.
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
