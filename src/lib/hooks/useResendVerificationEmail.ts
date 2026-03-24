'use client'

import { useMutation } from '@tanstack/react-query'

import { resendVerificationEmail } from '@/lib/api/supervision'
import { useUserSnackbar } from '@/lib/contexts/UserSnackbarContext'

import { useCooldownTimer } from './useCooldownTimer'

interface UseResendVerificationEmailReturn {
  resend: () => void
  isPending: boolean
  isOnCooldown: boolean
  countdown: string | null
  /** True while the button should be disabled (pending, cooldown, or no token). */
  isDisabled: boolean
}

/**
 * Wires the resend-verification-email action to the backend and manages the
 * 3-minute cooldown timer with localStorage persistence.
 *
 * @param token - The activationToken from signup, used as the resend key.
 */
export function useResendVerificationEmail(
  token: string | null | undefined,
): UseResendVerificationEmailReturn {
  const { showSuccess, showError } = useUserSnackbar()
  const { isOnCooldown, countdown, startCooldown } = useCooldownTimer(token)

  const mutation = useMutation({
    mutationFn: () => {
      if (!token?.trim()) {
        return Promise.reject(new Error('missing_token'))
      }
      return resendVerificationEmail(token.trim())
    },
    onSuccess: (result) => {
      if (result.kind === 'success') {
        showSuccess('We sent you another verification email.')
        startCooldown()
      } else {
        showError(result.message)
      }
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error && err.message === 'missing_token'
          ? "We couldn't find the verification details for this request."
          : "We couldn't resend the verification email right now. Please try again later."
      showError(message)
    },
  })

  return {
    resend: () => mutation.mutate(),
    isPending: mutation.isPending,
    isOnCooldown,
    countdown,
    isDisabled: !token?.trim() || mutation.isPending || isOnCooldown,
  }
}
