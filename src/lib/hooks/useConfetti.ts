import { useContext } from 'react'

import { type ConfettiApi, ConfettiContext } from '@/lib/contexts/ConfettiProvider'

/**
 * Returns the confetti API (`burst`, `fireworks`, `stop`).
 * Must be used within a `<ConfettiProvider>`.
 */
export function useConfetti(): ConfettiApi {
  const ctx = useContext(ConfettiContext)

  if (!ctx) {
    throw new Error(
      'useConfetti must be used within a <ConfettiProvider>. ' +
        'Wrap your app (or subtree) with <ConfettiProvider> in your layout.',
    )
  }

  return ctx
}
