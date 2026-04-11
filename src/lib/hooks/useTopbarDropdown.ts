'use client'

import { useEffect, useRef, useState } from 'react'

interface UseTopbarDropdownReturn {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
  close: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Manages open/close state for a topbar dropdown panel.
 *
 * Handles:
 * - Toggle on trigger click
 * - Close on pointer-down outside the container
 * - Close on Escape key
 *
 * Usage: attach `containerRef` to the wrapper div that includes both the
 * trigger button and the panel so click-outside detection works correctly.
 */
export function useTopbarDropdown(): UseTopbarDropdownReturn {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
    close: () => setOpen(false),
    containerRef,
  }
}
