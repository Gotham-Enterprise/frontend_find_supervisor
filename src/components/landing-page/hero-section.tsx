'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-hero-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="line-clamp-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Find the Right{' '}
              <span className="text-primary">Supervisor</span> to Guide Your
              Professional Journey
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Connect with licensed medical and mental-health supervisors who can
              support your clinical hours, career growth, and long-term success.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className={buttonVariants({ size: 'lg' })}>
                Find My Supervisor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className={buttonVariants({ size: 'lg', variant: 'outline' })}
              >
                See How It Works
              </a>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-96 w-full max-w-xl overflow-hidden lg:h-[28rem] lg:max-w-2xl">
              <Image
                src="/hero/landing-page.png"
                alt="Professional connecting with a supervisor via video call"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
