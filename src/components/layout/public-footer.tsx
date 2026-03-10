'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerColumns = [
  {
    heading: 'Professionals',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Sign In', href: '/login' },
      { label: 'Register', href: '/login' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'Supervisors',
    links: [
      { label: 'Create Profile', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'View Requests', href: '#' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'General',
    links: [
      { label: 'Contact Us', href: '#' },
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
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <Image
                src="/logo.png"
                alt="Find A Supervisor"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The leading platform for connecting mental health and healthcare
              professionals with licensed supervisors.
            </p>
            <form
              className="mt-4 flex gap-0 overflow-hidden rounded-lg border"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter Your Email Address"
                className="h-10 flex-1 border-0 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 shrink-0 rounded-none bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {footerColumns.map(({ heading, links }) => (
            <div key={heading}>
              <p className="mb-3 text-sm font-semibold text-foreground">
                {heading}
              </p>
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
            <p className="mb-3 text-sm font-semibold text-foreground">
              Download Our App
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-secondary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-secondary/90"
              >
                <span>Available on the App Store</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-secondary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-secondary/90"
              >
                <span>GET IT ON Google Play</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            ©{new Date().getFullYear()} All Rights Reserved. Find A Supervisor is
            a registered trademark.
          </p>
          <div className="flex gap-6">
            {['Facebook', 'Twitter', 'YouTube', 'Instagram'].map((name) => (
              <a
                key={name}
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={name}
              >
                <span className="text-sm">{name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
