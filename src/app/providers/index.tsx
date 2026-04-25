import { type ReactNode } from 'react'
import { Toaster } from 'sonner'

import { PresenceProvider } from '@/lib/contexts/PresenceContext'
import { UserProvider } from '@/lib/contexts/UserContext'
import { UserSnackbarProvider } from '@/lib/contexts/UserSnackbarContext'

import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <UserProvider>
        <PresenceProvider>
          <UserSnackbarProvider>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </UserSnackbarProvider>
        </PresenceProvider>
      </UserProvider>
    </QueryProvider>
  )
}
