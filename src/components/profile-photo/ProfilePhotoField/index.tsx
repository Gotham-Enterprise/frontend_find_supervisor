/* eslint-disable @next/next/no-img-element -- previewUrl is a local blob:// URL; next/image does not support blob URLs */
'use client'

import { Camera } from 'lucide-react'
import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { ProfilePhotoUploadDialog } from '../ProfilePhotoUploadDialog'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProfilePhotoFieldProps = {
  /** RHF field value — expects a File or undefined/null. */
  value: File | undefined | null
  onChange: (file: File | undefined) => void
  onBlur?: () => void
  className?: string
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * A form-field wrapper that:
 *  - Shows a prominent dashed-border upload area (empty state) or a circular
 *    avatar preview (filled state).
 *  - Opens `ProfilePhotoUploadDialog` when clicked.
 *  - Applies the cropped File back to the RHF field via `onChange`.
 *
 * Drop-in replacement for the basic `ProfilePhotoUpload` component wherever
 * the full edit modal experience is needed.
 */
export const ProfilePhotoField = React.forwardRef<HTMLButtonElement, ProfilePhotoFieldProps>(
  ({ value, onChange, onBlur, className }, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    // ── Preview URL management ─────────────────────────────────────────────────
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const activeUrlRef = useRef<string | null>(null)

    // Revoke blob URL on unmount.
    useEffect(() => {
      return () => {
        if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current)
      }
    }, [])

    // Keep preview in sync with RHF `value` (File). Required when the field remounts
    // (e.g. multi-step form): the File is still in form state but local preview was lost.
    /* eslint-disable react-hooks/set-state-in-effect -- blob URL must follow File identity; deferred setState breaks first paint */
    useLayoutEffect(() => {
      if (!(value instanceof File)) {
        if (activeUrlRef.current) {
          URL.revokeObjectURL(activeUrlRef.current)
          activeUrlRef.current = null
        }
        setPreviewUrl(null)
        return
      }
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current)
      }
      const url = URL.createObjectURL(value)
      activeUrlRef.current = url
      setPreviewUrl(url)
    }, [value])
    /* eslint-enable react-hooks/set-state-in-effect */

    // ── Save handler ──────────────────────────────────────────────────────────
    function handleSave(file: File) {
      onChange(file)
      onBlur?.()
    }

    const hasPhoto = value instanceof File && previewUrl !== null

    // ─────────────────────────────────────────────────────────────────────────
    return (
      <>
        <button
          ref={ref}
          type="button"
          onClick={() => setDialogOpen(true)}
          className={cn(
            'group w-full rounded-xl border-2 border-dashed border-input bg-muted/30 px-5 py-4 text-left',
            'transition-colors hover:border-primary/50 hover:bg-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className,
          )}
          aria-label={hasPhoto ? 'Edit profile photo' : 'Upload profile photo'}
        >
          <div className="flex items-center gap-4">
            {/* Avatar circle — preview or placeholder */}
            {hasPhoto ? (
              <div className="relative size-[72px] shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
                <img
                  src={previewUrl}
                  alt="Profile photo preview"
                  className="h-full w-full object-cover"
                />
                {/* Hover overlay */}
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Camera className="size-4 text-white drop-shadow" />
                </div>
              </div>
            ) : (
              <div
                aria-hidden
                className="flex size-[72px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors group-hover:border-primary/40"
              >
                <Camera className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary/60" />
              </div>
            )}

            {/* Text block */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {hasPhoto ? 'Profile photo selected' : 'Upload a clear profile photo'}
              </span>
              <span className="text-xs text-muted-foreground">
                {hasPhoto ? 'Click to edit or replace your photo' : 'JPG, PNG, WEBP · Max 5 MB'}
              </span>
              <span className="mt-1 text-xs font-semibold text-primary">
                {hasPhoto ? 'Edit photo →' : 'Click to upload photo →'}
              </span>
            </div>
          </div>
        </button>

        <ProfilePhotoUploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          currentFile={value instanceof File ? value : null}
        />
      </>
    )
  },
)
ProfilePhotoField.displayName = 'ProfilePhotoField'
