'use client'

import { File as FileIcon, FileImage, FileText, Upload, X } from 'lucide-react'
import { type MutableRefObject, type Ref, useCallback, useId, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UploadFileProps = {
  id?: string
  value: unknown
  onChange: (value: File | undefined) => void
  onBlur?: () => void
  inputRef?: Ref<HTMLInputElement>
  accept?: string
  uploadTitle?: string
  uploadHint?: string
  removeFileAriaLabel?: string
  hideUploadSectionWhenFileSelected?: boolean
  showFileSize?: boolean
  /** Trailing control in the empty state (e.g. “Browse”). Set `null` to hide. */
  browseButtonLabel?: string | null
  className?: string
  disabled?: boolean
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File
}

function getFileCategory(file: File): 'image' | 'docs' | 'file' {
  const mime = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  const extension = name.includes('.') ? (name.split('.').pop() ?? '') : ''

  if (mime.startsWith('image/')) return 'image'

  const docExtensions = new Set([
    'pdf',
    'doc',
    'docx',
    'txt',
    'rtf',
    'odt',
    'xls',
    'xlsx',
    'csv',
    'ppt',
    'pptx',
  ])

  if (
    mime.startsWith('text/') ||
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('officedocument') ||
    docExtensions.has(extension)
  ) {
    return 'docs'
  }

  return 'file'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(node)
  } else {
    ;(ref as MutableRefObject<T | null>).current = node
  }
}

export function UploadFile({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  accept = '*/*',
  uploadTitle = 'Upload file',
  uploadHint = 'Choose a file from your device',
  removeFileAriaLabel = 'Remove uploaded file',
  hideUploadSectionWhenFileSelected = true,
  showFileSize = true,
  browseButtonLabel = 'Browse',
  className,
  disabled = false,
}: UploadFileProps) {
  const generatedId = useId()
  const inputId = id ?? `upload-file-${generatedId.replace(/:/g, '')}`
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const selectedFile = isFile(value) ? value : undefined
  const fileCategory = selectedFile ? getFileCategory(selectedFile) : null
  const fileSizeLabel = selectedFile && showFileSize ? formatFileSize(selectedFile.size) : null

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      localInputRef.current = node
      assignRef(inputRef, node)
    },
    [inputRef],
  )

  const UploadedFileIcon =
    fileCategory === 'image' ? FileImage : fileCategory === 'docs' ? FileText : FileIcon

  function clearInputElement() {
    if (localInputRef.current) localInputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        ref={setRefs}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(e) => {
          const file = e.target.files?.[0]
          onChange(file)
          e.currentTarget.value = ''
        }}
        className="sr-only"
      />

      {(!hideUploadSectionWhenFileSelected || !selectedFile) && (
        <div
          className={cn(
            'rounded-xl border-2 border-dashed border-input bg-muted/30 px-4 py-3 transition-colors',
            !disabled && 'hover:border-primary/50 hover:bg-primary/5',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <label
            htmlFor={inputId}
            className={cn(
              'flex items-center gap-3 text-left',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <div
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/20 bg-background"
            >
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium leading-tight text-foreground">{uploadTitle}</p>
              <p className="text-xs leading-tight text-muted-foreground">{uploadHint}</p>
            </div>
            {browseButtonLabel != null && browseButtonLabel !== '' ? (
              <span className="pointer-events-none shrink-0 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                {browseButtonLabel}
              </span>
            ) : null}
          </label>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <UploadedFileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              {fileSizeLabel ? (
                <p className="text-xs text-muted-foreground">{fileSizeLabel}</p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              onChange(undefined)
              clearInputElement()
            }}
            aria-label={removeFileAriaLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
