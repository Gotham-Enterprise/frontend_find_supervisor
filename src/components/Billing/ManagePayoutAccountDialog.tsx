'use client'

import { loadConnectAndInitialize } from '@stripe/connect-js'
import { ConnectAccountManagement, ConnectComponentsProvider } from '@stripe/react-connect-js'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { createPayoutAccountSession } from '@/lib/api/supervision'
import { payoutKeys } from '@/lib/hooks/usePayouts'

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

/**
 * Stripe's embedded account management, inside the app: the supervisor edits
 * their bank account and personal details here instead of the Express
 * dashboard, which we don't control (it also lets them close the account).
 * A child of DialogContent, so a fresh Account Session is made per opening.
 */
function AccountManagement() {
  const queryClient = useQueryClient()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectInstance] = useState(() =>
    loadConnectAndInitialize({
      publishableKey: STRIPE_KEY,
      fetchClientSecret: async () => {
        try {
          const { clientSecret } = await createPayoutAccountSession()
          return clientSecret
        } catch (error) {
          // e.g. the account was closed from Stripe: the card shows the new status.
          void queryClient.invalidateQueries({ queryKey: payoutKeys.status() })
          throw error
        }
      },
      // The component renders in Stripe's own frame, so it can't see the app's
      // next/font Geist or CSS variables: load Geist from Google Fonts and pass
      // the theme colors (hex equivalents of the light-theme tokens in globals.css).
      fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700' }],
      appearance: {
        overlays: 'dialog',
        variables: {
          fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
          fontSizeBase: '14px',
          colorPrimary: '#006d36',
          colorBackground: '#f9fafb',
          colorText: '#181818',
          colorSecondaryText: '#737373',
          colorBorder: '#e5e5e5',
          colorDanger: '#e7000b',
          formAccentColor: '#006d36',
          buttonSecondaryColorBackground: '#ffffff',
          buttonSecondaryColorBorder: '#e5e5e5',
          buttonSecondaryColorText: '#181818',
          borderRadius: '8px',
        },
      },
    }),
  )

  if (loadError) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
        {loadError}
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      <ConnectComponentsProvider connectInstance={connectInstance}>
        <ConnectAccountManagement
          onLoaderStart={() => setIsLoading(false)}
          onLoadError={() => {
            setIsLoading(false)
            setLoadError("We couldn't load your payout account. Close this and try again.")
          }}
        />
      </ConnectComponentsProvider>
    </>
  )
}

export function ManagePayoutAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // The bank account (or details) may have changed: refresh the card.
    if (!next) void queryClient.invalidateQueries({ queryKey: payoutKeys.status() })
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,860px)] max-w-2xl"
        header={
          <>
            <DialogTitle>Manage Payout Account</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the bank account your payouts go to and your account details. Stripe may ask
              you to verify it&apos;s you first.
            </p>
          </>
        }
      >
        <AccountManagement />
      </DialogContent>
    </DialogRoot>
  )
}
