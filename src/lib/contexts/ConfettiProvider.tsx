'use client'

import type { Options as ConfettiOptions } from 'canvas-confetti'
import { createContext, type ReactNode, useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConfettiEffectOptions {
  /** Duration in milliseconds (default: 15000 for fireworks, ignored for burst) */
  duration?: number
  /** Override individual burst options */
  burstOptions?: ConfettiOptions
}

export interface ConfettiApi {
  /** Single celebratory burst — 5 layered waves for a rich "pop" (fires on global canvas) */
  burst: (options?: ConfettiEffectOptions) => void
  /** Burst scoped to a specific canvas element (confetti renders inside that canvas) */
  burstOnCanvas: (canvas: HTMLCanvasElement, options?: ConfettiEffectOptions) => void
  /** Sustained fireworks show — dual streams from left & right for `duration` ms */
  fireworks: (options?: ConfettiEffectOptions) => void
  /** Stop all ongoing fireworks and clear in-flight particles */
  stop: () => void
}

export const ConfettiContext = createContext<ConfettiApi | null>(null)

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const BURST_BASE_COUNT = 200
const BURST_ORIGIN: ConfettiOptions = { origin: { y: 0.7 } }

const BURST_WAVES: { ratio: number; opts: ConfettiOptions }[] = [
  { ratio: 0.25, opts: { spread: 26, startVelocity: 55 } },
  { ratio: 0.2, opts: { spread: 60 } },
  { ratio: 0.35, opts: { spread: 100, decay: 0.91, scalar: 0.8 } },
  { ratio: 0.1, opts: { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 } },
  { ratio: 0.1, opts: { spread: 120, startVelocity: 45 } },
]

const FIREWORKS_DEFAULTS: ConfettiOptions = {
  startVelocity: 30,
  spread: 360,
  ticks: 60,
  zIndex: 0,
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const confettiRef = useRef<
    (((options?: ConfettiOptions) => Promise<undefined> | null) & { reset?: () => void }) | null
  >(null)
  const confettiModuleRef = useRef<{
    create: (
      canvas: HTMLCanvasElement,
      options?: { resize?: boolean; useWorker?: boolean },
    ) => ((opts?: ConfettiOptions) => Promise<null> | null) & { reset: () => void }
  } | null>(null)

  // Lazy-load canvas-confetti (client only, never imported during SSR)
  useEffect(() => {
    void import('canvas-confetti').then((mod) => {
      confettiModuleRef.current = mod.default
      confettiRef.current = mod.default
    })
  }, [])

  // Detect reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ------ API methods (stable refs — never cause re-renders) ------

  const burst = useCallback((options?: ConfettiEffectOptions) => {
    if (prefersReducedMotion.current || !confettiRef.current) return
    const confetti = confettiRef.current
    const overrides = options?.burstOptions ?? {}

    for (const { ratio, opts } of BURST_WAVES) {
      void confetti({
        ...BURST_ORIGIN,
        ...opts,
        particleCount: Math.floor(BURST_BASE_COUNT * ratio),
        ...overrides,
      })
    }
  }, [])

  const canvasInstanceMap = useRef(
    new WeakMap<
      HTMLCanvasElement,
      ((opts?: ConfettiOptions) => Promise<null> | null) & { reset: () => void }
    >(),
  )

  const burstOnCanvas = useCallback(
    (canvas: HTMLCanvasElement, options?: ConfettiEffectOptions) => {
      if (prefersReducedMotion.current || !confettiModuleRef.current) return

      let localConfetti = canvasInstanceMap.current.get(canvas)
      if (!localConfetti) {
        localConfetti = confettiModuleRef.current.create(canvas, {
          resize: true,
        })
        canvasInstanceMap.current.set(canvas, localConfetti)
      }

      const overrides = options?.burstOptions ?? {}

      for (const { ratio, opts } of BURST_WAVES) {
        void localConfetti({
          ...BURST_ORIGIN,
          ...opts,
          particleCount: Math.floor(BURST_BASE_COUNT * ratio),
          ...overrides,
        })
      }
    },
    [],
  )

  const fireworks = useCallback((options?: ConfettiEffectOptions) => {
    if (prefersReducedMotion.current || !confettiRef.current) return
    const confetti = confettiRef.current

    // Clear any existing fireworks first
    if (intervalRef.current) clearInterval(intervalRef.current)

    const duration = options?.duration ?? 15_000
    const overrides = options?.burstOptions ?? {}
    const animationEnd = Date.now() + duration

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Left stream
      void confetti({
        ...FIREWORKS_DEFAULTS,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        ...overrides,
      })
      // Right stream
      void confetti({
        ...FIREWORKS_DEFAULTS,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        ...overrides,
      })
    }, 250)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    confettiRef.current?.reset?.()
  }, [])

  const api = useRef<ConfettiApi>({ burst, burstOnCanvas, fireworks, stop })

  // Keep ref in sync (avoids creating a new object every render)
  api.current.burst = burst
  api.current.burstOnCanvas = burstOnCanvas
  api.current.fireworks = fireworks
  api.current.stop = stop

  return <ConfettiContext.Provider value={api.current}>{children}</ConfettiContext.Provider>
}
