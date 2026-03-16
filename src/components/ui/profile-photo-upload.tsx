/* eslint-disable @next/next/no-img-element -- preview renders a local blob URL; next/image does not support object:// URLs */
'use client'

import { Camera, User, X } from 'lucide-react'
import { type Ref, useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

export type ProfilePhotoUploadProps = {
  /** Forwarded to the hidden <input id>. Auto-generated if omitted. */
  id?: string
  /** Current value — expects a File or undefined/null. */
  value: unknown
  onChange: (file: File | undefined) => void
  onBlur?: () => void
  /** Ref forwarded to the hidden <input>. */
  inputRef?: Ref<HTMLInputElement>
  /** MIME/extension filter forwarded to <input accept>. Defaults to image/*. */
  accept?: string
  /** Avatar diameter: sm=64px, md=96px, lg=128px. */
  size?: Size
  /** Whether to show the remove (×) button while a photo is selected. */
  allowRemove?: boolean
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File
}

const AVATAR_SIZE: Record<Size, string> = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
}

const ICON_SIZE: Record<Size, string> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePhotoUpload({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  accept = 'image/*',
  size = 'md',
  allowRemove = true,
  className,
}: ProfilePhotoUploadProps) {
  const generatedId = useId()
  const inputId = id ?? `profile-photo-${generatedId.replace(/:/g, '')}`
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Preview URL lives in state so React re-renders when it changes.
  // All mutations happen in event handlers — never in the effect body —
  // which satisfies the react-hooks/set-state-in-effect compiler rule.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // activeUrlRef tracks the live object URL so the unmount cleanup can
  // revoke it. Written only in event handlers (outside render).
  const activeUrlRef = useRef<string | null>(null)

  // Revoke the outstanding URL only when the component unmounts.
  useEffect(() => {
    return () => {
      const url = activeUrlRef.current
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  // ── Ref forwarding ────────────────────────────────────────────────────────
  function setRefs(node: HTMLInputElement | null) {
    fileInputRef.current = node
    // react-hook-form provides a callback ref
    if (typeof inputRef === 'function') inputRef(node)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    // Revoke the previous URL before creating a new one
    if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current)

    const url = file ? URL.createObjectURL(file) : null
    activeUrlRef.current = url
    setPreviewUrl(url)

    onChange(file)
    // Reset so re-selecting the same file fires onChange again
    e.target.value = ''
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current)
    activeUrlRef.current = null
    setPreviewUrl(null)
    onChange(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openPicker() {
    fileInputRef.current?.click()
  }

  // Derive display state from props (not refs — never touched during render)
  const hasPhoto = isFile(value) && previewUrl !== null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Hidden file input */}
      <input
        id={inputId}
        type="file"
        accept={accept}
        ref={setRefs}
        onBlur={onBlur}
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* Avatar circle */}
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          aria-label={hasPhoto ? 'Change profile photo' : 'Upload profile photo'}
          className={cn(
            'group relative overflow-hidden rounded-full border-2 transition-colors',
            AVATAR_SIZE[size],
            hasPhoto
              ? 'border-primary/30 hover:border-primary/60'
              : 'border-dashed border-input bg-muted/50 hover:border-primary/50 hover:bg-muted',
          )}
        >
          {/* Live preview */}
          {hasPhoto && (
            <img
              src={previewUrl}
              alt="Profile photo preview"
              className="h-full w-full object-cover"
            />
          )}

          {/* Placeholder silhouette */}
          {!hasPhoto && (
            <User
              className={cn(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40',
                ICON_SIZE[size],
              )}
              aria-hidden
            />
          )}

          {/* Camera icon overlay — visible on hover */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Camera className="h-5 w-5 text-white drop-shadow" />
          </div>
        </button>

        {/* Remove button — top-right corner, shown only when a photo is selected */}
        {allowRemove && hasPhoto && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove profile photo"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-opacity hover:bg-destructive/80"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Helper text */}
      <span className="text-xs text-muted-foreground">
        {hasPhoto ? 'Click to change photo' : 'Upload photo'}
      </span>
    </div>
  )
}
