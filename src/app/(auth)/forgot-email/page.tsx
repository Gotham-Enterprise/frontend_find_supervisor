import { ForgotEmailPage } from '@/components/ForgotEmailForm'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata = {
  title: 'Recover Email',
  description: 'Recover access to your Find A Supervisor account using your phone number.',
  ...noIndexMetadata,
}

export default function ForgotEmailRoutePage() {
  return <ForgotEmailPage />
}
