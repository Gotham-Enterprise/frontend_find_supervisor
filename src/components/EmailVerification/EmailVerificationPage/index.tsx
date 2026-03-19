'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { PublicHeader } from '@/components/Layout/public-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { EmailVerificationCard } from '../EmailVerificationCard'
import type { VerificationPageData } from '../types'

interface Props {
  data: VerificationPageData
}

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Us', href: '/contact' },
]

export function EmailVerificationPage({ data }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-14 sm:py-20">
        <EmailVerificationCard data={data} />

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'mt-6 gap-1.5 text-[#006D36] hover:bg-[#006D36]/10 hover:text-[#006D36]',
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Homepage
        </Link>
      </main>

      <footer className="border-t border-border py-5 text-center">
        <nav className="flex items-center justify-center gap-6">
          {footerLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}
