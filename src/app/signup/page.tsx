import { parseSignupRoleFromType } from '@/components/Signup/helpers'
import { SignupPage } from '@/components/Signup/SignupPage'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata = {
  title: 'Create Account',
  description: 'Create your free Find A Supervisor account.',
  ...noIndexMetadata,
}

type PageProps = {
  searchParams: Promise<{ type?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { type } = await searchParams
  const initialRole = parseSignupRoleFromType(type)

  return <SignupPage initialRole={initialRole} />
}
