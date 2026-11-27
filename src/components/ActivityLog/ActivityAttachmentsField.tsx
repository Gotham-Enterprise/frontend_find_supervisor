'use client'

import { FilePlus2, FileText, Undo2, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useObjectUrls } from '@/lib/hooks/useObjectUrls'
import {
  type AttachmentLimits,
  formatFileSize,
  isImageType,
  pickAttachmentFiles,
} from '@/lib/utils/activity-attachments'
import type { ActivityAttachment } from '@/types/activity-log'

/**
 * Files on an activity entry while the Medical Director edits it: the ones
 * already saved (each can be marked for removal and brought back), plus new
 * ones to upload. Nothing changes on the server until the entry is saved.
 */
export function ActivityAttachmentsField({
  existing,
  removeIds,
  onRemoveIdsChange,
  files,
  onFilesChange,
  limits,
  disabled,
}: {
  /** Saved on the entry (edit only). */
  existing: ActivityAttachment[]
  /** Saved files marked for removal. */
  removeIds: string[]
  onRemoveIdsChange: (ids: string[]) => void
  /** New files to upload. */
  files: File[]
  onFilesChange: (files: File[]) => void
  limits: AttachmentLimits
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const kept = existing.filter((a) => !removeIds.includes(a.id)).length
  const room = limits.perEntry - kept
  const previews = useObjectUrls(files, isImageType)

  function addFiles(list: FileList | null) {
    if (!list) return
    const result = pickAttachmentFiles(files, Array.from(list), room, limits)
    setProblem(result.problem)
    onFilesChange(result.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeFile(index: number) {
    setProblem(null)
    onFilesChange(files.filter((_, j) => j !== index))
  }

  const removeButtonClass =
    'absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  const typeLabel = 'JPG, PNG or PDF'

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Files <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <span className="text-xs tabular-nums text-muted-foreground">
          {kept + files.length} / {limits.perEntry} · {typeLabel}, up to {limits.maxMb} MB each
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        A signed protocol, an agenda, a summary. Don&apos;t attach patient records.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={limits.types.join(',')}
        multiple
        hidden
        disabled={disabled || files.length >= room}
        onChange={(e) => addFiles(e.target.files)}
        aria-label="Attach files"
      />
      <ul className="mt-2 flex flex-wrap gap-2">
        {existing.map((attachment) => {
          const removed = removeIds.includes(attachment.id)
          return (
            <li key={attachment.id} className="relative">
              <div
                className={`flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-md border px-1 ${removed ? 'opacity-40' : 'bg-muted/40'}`}
                title={removed ? `${attachment.fileName} will be removed` : attachment.fileName}
              >
                {isImageType(attachment.contentType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="size-full rounded-md object-cover"
                  />
                ) : (
                  <>
                    <FileText className="size-5 text-muted-foreground" aria-hidden />
                    <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                      {attachment.fileName}
                    </span>
                  </>
                )}
              </div>
              {removed ? (
                <button
                  type="button"
                  aria-label={`Keep ${attachment.fileName}`}
                  disabled={disabled}
                  onClick={() => onRemoveIdsChange(removeIds.filter((id) => id !== attachment.id))}
                  className="absolute inset-0 flex items-center justify-center rounded-md text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 shadow-sm">
                    <Undo2 className="size-3" aria-hidden />
                    Undo
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={`Remove ${attachment.fileName}`}
                  disabled={disabled}
                  onClick={() => onRemoveIdsChange([...removeIds, attachment.id])}
                  className={removeButtonClass}
                >
                  <X className="size-3.5" />
                </button>
              )}
              <span className="mt-0.5 block w-24 truncate text-[10px] text-muted-foreground">
                {removed ? 'Will be removed' : formatFileSize(attachment.sizeBytes)}
              </span>
            </li>
          )
        })}
        {files.map((file, i) => (
          <li key={`${file.name}-${file.size}`} className="relative">
            {previews[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previews[i]!}
                alt={file.name}
                className="h-20 w-24 rounded-md border object-cover"
              />
            ) : (
              <div className="flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-md border bg-muted/40 px-1">
                <FileText className="size-5 text-muted-foreground" aria-hidden />
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                  {file.name}
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              onClick={() => removeFile(i)}
              className={removeButtonClass}
            >
              <X className="size-3.5" />
            </button>
            <span className="mt-0.5 block w-24 truncate text-[10px] text-muted-foreground">
              {formatFileSize(file.size)} · new
            </span>
          </li>
        ))}
        {files.length < room && (
          <li>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="h-20 w-24 flex-col gap-1 rounded-md border-dashed px-0 text-xs"
            >
              <FilePlus2 className="size-4" aria-hidden />
              Add file
            </Button>
          </li>
        )}
      </ul>
      <p role="status" aria-live="polite" className="mt-1 min-h-4 text-xs text-destructive">
        {problem}
      </p>
    </div>
  )
}
