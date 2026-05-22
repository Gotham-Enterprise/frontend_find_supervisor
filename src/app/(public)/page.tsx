import type { Metadata } from 'next'

import { HomePage } from '@/components/Home'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} | Licensed Clinical Supervision Made Easier`,
  description:
    'Find licensed clinical supervisors by location, license type, specialty, and supervision needs. Connect with verified supervisors across all 50 states.',
  path: '/',
  og: { type: 'website' },
})

export default function LandingRoutePage() {
  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />
      <HomePage />
    </>
  )
}
