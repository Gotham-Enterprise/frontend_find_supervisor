import type { JsonLdObject } from '@/lib/seo/jsonld'

interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[]
}

/**
 * Renders a JSON-LD <script> tag for structured data.
 * This is a Server Component — do NOT add 'use client'.
 *
 * Usage:
 *   <JsonLd data={generateWebSiteJsonLd()} />
 *   <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  )
}
