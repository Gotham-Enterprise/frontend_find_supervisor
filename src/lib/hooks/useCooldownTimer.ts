'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  formatCooldownCountdown,
  getRemainingCooldown,
  saveCooldownExpiry,
} from '@/lib/utils/cooldown'

interface CooldownTimer {
  /** True while a cooldown is still active. */
  isOnCooldown: boolean
  /** Remaining time formatted as `M:SS`, or null when no cooldown is active. */
  countdown: string | null
  /** Remaining milliseconds. */
  remainingMs: number
  /** Call after a successful resend to start (or restart) the cooldown. */
  startCooldown: () => void
}

/**
 * Manages a 3-minute resend cooldown timer, persisted to localStorage so it
 * survives page refreshes and back-navigation.
 *
 * @param token - The activation token used as the localStorage key scope.
 *   Pass null/undefined when the token is not yet available; the timer will be
 *   inactive and `startCooldown` will be a no-op.
 */
export function useCooldownTimer(token: string | null | undefined): CooldownTimer {
  const [prevToken, setPrevToken] = useState<string | null | undefined>(token)

  // Lazy initializer reads the persisted cooldown on mount — no synchronous setState needed in an effect.
  const [remainingMs, setRemainingMs] = useState(() => (token ? getRemainingCooldown(token) : 0))

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Derived-state pattern: re-sync remainingMs during render when token changes,
  // instead of inside an effect, to avoid cascading renders.
  if (prevToken !== token) {
    setPrevToken(token)
    setRemainingMs(token ? getRemainingCooldown(token) : 0)
  }

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (!token) return
    const r = getRemainingCooldown(token)
    setRemainingMs(r)
    if (r <= 0) clearTick()
  }, [token, clearTick])

  // Only starts the interval when there is an active cooldown — no synchronous setState here.
  useEffect(() => {
    if (!token) return
    const r = getRemainingCooldown(token)
    if (r > 0) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return clearTick
  }, [token, tick, clearTick])

  const startCooldown = useCallback(() => {
    if (!token) return
    saveCooldownExpiry(token)
    const r = getRemainingCooldown(token)
    setRemainingMs(r)
    clearTick()
    intervalRef.current = setInterval(tick, 1000)
  }, [token, tick, clearTick])

  return {
    isOnCooldown: remainingMs > 0,
    countdown: remainingMs > 0 ? formatCooldownCountdown(remainingMs) : null,
    remainingMs,
    startCooldown,
  }
}
