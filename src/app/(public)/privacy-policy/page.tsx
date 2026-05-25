import type { Metadata } from 'next'

import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `Read the ${SITE_NAME} privacy policy to understand how we handle your data and protect your privacy.`,
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />
}
