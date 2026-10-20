'use client'

import { ImagePlus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { DisputeAttachment } from '@/types/sessions'

export const DISPUTE_ATTACHMENTS_MAX = 3
export const DISPUTE_ATTACHMENT_MAX_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Evidence for a dispute: up to 3 JPG/PNG images, 5 MB each, chosen before
 * the dispute is sent. Previews are object URLs, revoked when they change.
 */
export function DisputeAttachmentsField({
  files,
  onChange,
  disabled,
}: {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    let problem: string | null = null
    for (const file of Array.from(list)) {
      if (next.length >= DISPUTE_ATTACHMENTS_MAX) {
        problem = `You can attach up to ${DISPUTE_ATTACHMENTS_MAX} images.`
        break
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        problem = `${file.name} isn't a JPG or PNG image.`
        continue
      }
      if (file.size > DISPUTE_ATTACHMENT_MAX_MB * 1024 * 1024) {
        problem = `${file.name} is over ${DISPUTE_ATTACHMENT_MAX_MB} MB.`
        continue
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue
      next.push(file)
    }
    setError(problem)
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  const full = files.length >= DISPUTE_ATTACHMENTS_MAX

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground">
          Evidence <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <span className="text-xs text-muted-foreground">
          {files.length} / {DISPUTE_ATTACHMENTS_MAX} images · up to {DISPUTE_ATTACHMENT_MAX_MB} MB
          each
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        disabled={disabled || full}
        onChange={(e) => addFiles(e.target.files)}
      />
      <div className="mt-1.5 flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div key={`${file.name}-${file.size}`} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previews[i]}
              alt={file.name}
              className="size-20 rounded-md border object-cover"
            />
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 rounded-full border bg-background p-0.5 text-muted-foreground shadow-sm hover:text-foreground"
            >
              <X className="size-3" />
            </button>
            <span className="mt-0.5 block w-20 truncate text-[10px] text-muted-foreground">
              {formatSize(file.size)}
            </span>
          </div>
        ))}
        {!full && (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="size-20 flex-col gap-1 rounded-md border-dashed px-0 text-xs"
          >
            <ImagePlus className="size-4" aria-hidden />
            Add image
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Screenshots of your calendar, messages, or notes that show what happened.
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Thumbnails of a dispute's evidence; each opens the full image in a new tab. */
export function DisputeAttachmentThumbs({ attachments }: { attachments: DisputeAttachment[] }) {
  if (attachments.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          title={a.fileName}
          className="block rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.url} alt={a.fileName} className="size-16 rounded-md object-cover" />
        </a>
      ))}
    </div>
  )
}
