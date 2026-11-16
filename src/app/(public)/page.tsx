import type { Metadata } from 'next'

import { HomePage } from '@/components/Home'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'

const baseMetadata = buildMetadata({
  title: `${SITE_NAME} | Licensed Clinical Supervision Made Easier`,
  description:
    'Find licensed clinical supervisors and Medical Directors by location, license type, specialty, and supervision needs. Connect with verified supervisors and Medical Directors across all 50 states.',
  path: '/',
  og: { type: 'website' },
})

// The homepage title already leads with the brand, so it opts out of the
// root "%s | Find A Supervisor" template (which would repeat the site name).
export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: baseMetadata.title as string },
}

export default function LandingRoutePage() {
  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />
      <HomePage />
    </>
  )
}
