import { type ReactNode } from 'react'
import { Toaster } from 'sonner'

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
        <UserSnackbarProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </UserSnackbarProvider>
      </UserProvider>
    </QueryProvider>
  )
}
