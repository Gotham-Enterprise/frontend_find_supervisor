'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
      {/* Subtle wave/radial pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-96 rounded-full bg-white/5 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start Your Supervision Journey Today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
          Join thousands of medical and mental-health professionals finding the
          support they need to grow.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className:
                'border-white bg-white !text-[#181818] hover:bg-white/90 [&_svg]:!text-[#181818]',
            })}
          >
            Find a Supervisor Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
