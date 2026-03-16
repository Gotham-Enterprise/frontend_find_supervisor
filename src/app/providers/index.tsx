import { type ReactNode } from 'react'
import { Toaster } from 'sonner'

import { UserSnackbarProvider } from '@/lib/contexts/UserSnackbarContext'

import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <UserSnackbarProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </UserSnackbarProvider>
    </QueryProvider>
  )
}
