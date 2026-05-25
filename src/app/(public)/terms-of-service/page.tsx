import type { Metadata } from 'next'

import { TermsOfService } from '@/components/TermsOfService'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'

export const metadata: Metadata = buildMetadata({
  title: `Terms of Service | ${SITE_NAME}`,
  description: `Read the ${SITE_NAME} terms of service to understand the rules and conditions for using our platform.`,
  path: '/terms-of-service',
})

export default function TermsOfServicePage() {
  return <TermsOfService />
}
