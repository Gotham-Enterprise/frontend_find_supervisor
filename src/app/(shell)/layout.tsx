import type { Metadata } from 'next'

import { ShellLayout } from '@/components/Layout/shell-layout'
import { noIndexMetadata } from '@/lib/seo/config'

/**
 * All routes inside (shell) are authenticated/private.
 * Set noindex at the layout level so every child route is excluded from search engines
 * by default. Individual pages can still export their own metadata for titles.
 */
export const metadata: Metadata = {
  ...noIndexMetadata,
}

export default function ProtectedShellLayout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>
}
