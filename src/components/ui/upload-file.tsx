'use client'

import { File as FileIcon, FileImage, FileText, Upload, X } from 'lucide-react'
import { type Ref, useId, useRef } from 'react'

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
  className?: string
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
  className,
}: UploadFileProps) {
  const generatedId = useId()
  const inputId = id ?? `upload-file-${generatedId.replace(/:/g, '')}`
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const selectedFile = isFile(value) ? value : undefined
  const fileCategory = selectedFile ? getFileCategory(selectedFile) : null
  const fileSizeLabel = selectedFile && showFileSize ? formatFileSize(selectedFile.size) : null

  const setRefs = (node: HTMLInputElement | null) => {
    localInputRef.current = node

    if (!inputRef) return
    if (typeof inputRef === 'function') {
      inputRef(node)
    }
  }

  const UploadedFileIcon =
    fileCategory === 'image' ? FileImage : fileCategory === 'docs' ? FileText : FileIcon

  return (
    <div className={cn('space-y-3', className)}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        ref={setRefs}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.files?.[0])}
        className="sr-only"
      />

      {(!hideUploadSectionWhenFileSelected || !selectedFile) && (
        <div className="relative rounded-xl border border-dashed border-input bg-muted/30 p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
          <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{uploadTitle}</p>
              <p className="text-xs text-muted-foreground">{uploadHint}</p>
            </div>
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
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onChange(undefined)}
            aria-label={removeFileAriaLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
