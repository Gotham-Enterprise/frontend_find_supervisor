import Link from 'next/link'

import type { BreadcrumbItem } from '@/lib/seo/jsonld'
import { generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import { cn } from '@/lib/utils'

import { JsonLd } from './JsonLd'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Renders visible breadcrumb navigation + BreadcrumbList JSON-LD structured data.
 * Server Component — safe for public SEO pages.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { name: 'Home', href: '/' },
 *     { name: 'Supervisors', href: '/supervisors' },
 *     { name: 'Texas', href: '/supervisors/texas' },
 *   ]} />
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1">
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="transition-colors hover:text-foreground">
                      {item.name}
                    </Link>
                    <span aria-hidden="true" className="select-none">
                      /
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
