'use client'

import { ArrowRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    heading: 'By License Type',
    links: [
      { label: 'LCSW Supervisors', href: '/supervisors/california/lcsw' },
      { label: 'LMFT Supervisors', href: '/supervisors/california/lmft' },
      { label: 'LPC Supervisors', href: '/supervisors/texas/lpc' },
      { label: 'LMHC Supervisors', href: '/supervisors/new-york/lmhc' },
      { label: 'LPCC Supervisors', href: '/supervisors/california/lpcc' },
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
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
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
              The leading platform for connecting mental health and healthcare professionals with
              licensed supervisors.
            </p>
            <form
              className="mt-4 flex gap-0 overflow-hidden rounded-lg border bg-card"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                className="h-10 flex-1 rounded-none border-0 bg-transparent text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
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

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Download Our App</p>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/app-store.png"
                  alt="Download on the App Store"
                  width={135}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="#"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/play-store.png"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            ©{new Date().getFullYear()} All Rights Reserved. Find A Supervisor is a registered
            trademark.
          </p>
          <div className="flex gap-4">
            {[
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Youtube, label: 'YouTube' },
              { Icon: Instagram, label: 'Instagram' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
