import { ForgotPasswordPage } from '@/components/ForgotPasswordForm'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata = {
  title: 'Reset Password',
  description: 'Reset your Find A Supervisor account password.',
  ...noIndexMetadata,
}

export default function ForgotPasswordRoutePage() {
  return <ForgotPasswordPage />
}
