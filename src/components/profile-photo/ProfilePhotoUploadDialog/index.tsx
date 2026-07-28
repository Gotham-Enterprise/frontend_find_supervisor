'use client'

import { AlertCircle, Camera, RotateCcw, RotateCw, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

import { Button } from '@/components/ui/button'
import { DialogClose, DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'

import { CameraCapture } from '../CameraCapture'
import {
  getCroppedImg,
  readFileAsDataUrl,
  readRemoteImageAsDataUrl,
  validateImageFile,
} from '../helpers'
import { PhotoGuidelines } from '../PhotoGuidelines'
import { type CropArea, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../types'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProfilePhotoUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the cropped/rotated output File when the user clicks Save. */
  onSave: (file: File) => void
  /**
   * Pre-populates the editor with the existing saved photo so the user can
   * re-edit rather than re-upload from scratch.
   */
  currentFile?: File | null
  /**
   * Remote URL of the already-saved photo. Used to pre-populate the editor
   * when no `currentFile` has been staged this session (e.g. reopening the
   * edit form after a previous save).
   */
  currentImageUrl?: string | null
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function CropEmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Upload className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-foreground">No photo selected</p>
      <p className="text-xs text-muted-foreground">
        Upload an image or take a photo to get started
      </p>
    </div>
  )
}

// ─── Dialog component ──────────────────────────────────────────────────────────

export function ProfilePhotoUploadDialog({
  open,
  onOpenChange,
  onSave,
  currentFile,
  currentImageUrl,
}: ProfilePhotoUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Editor state ─────────────────────────────────────────────────────────────
  // 'edit' shows the crop editor (or empty state); 'camera' shows the live
  // webcam view so the user can capture a photo instead of uploading one.
  const [mode, setMode] = useState<'edit' | 'camera'>('edit')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(ZOOM_MIN)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const hasImage = imageSrc !== null
  const editingDisabled = !hasImage || mode === 'camera'

  // ── Reset helpers ─────────────────────────────────────────────────────────────

  function resetEdits() {
    setCrop({ x: 0, y: 0 })
    setZoom(ZOOM_MIN)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  // ── Populate editor when dialog opens ─────────────────────────────────────────

  // Refs let the effect read the latest props without re-running every time
  // their references change while the dialog is open.
  const currentFileRef = useRef(currentFile)
  currentFileRef.current = currentFile
  const currentImageUrlRef = useRef(currentImageUrl)
  currentImageUrlRef.current = currentImageUrl

  useEffect(() => {
    if (!open) return

    setMode('edit')
    setValidationError(null)
    const file = currentFileRef.current
    const savedUrl = currentImageUrlRef.current

    // A file staged this session wins over the previously saved remote photo.
    const load =
      file instanceof File
        ? readFileAsDataUrl(file)
        : savedUrl
          ? readRemoteImageAsDataUrl(savedUrl)
          : Promise.resolve(null)

    let cancelled = false
    load
      .then((dataUrl) => {
        if (cancelled) return
        setImageSrc(dataUrl)
        resetEdits()
      })
      .catch(() => {
        if (cancelled) return
        setImageSrc(null)
        resetEdits()
      })

    return () => {
      cancelled = true
    }
  }, [open])

  // ── File input ────────────────────────────────────────────────────────────────

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  async function loadFile(file: File) {
    const result = validateImageFile(file)
    if (!result.valid) {
      setValidationError(result.error)
      return
    }
    try {
      setValidationError(null)
      const dataUrl = await readFileAsDataUrl(file)
      setImageSrc(dataUrl)
      resetEdits()
      setMode('edit')
    } catch {
      setValidationError('Could not read the image. Please try a different file.')
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void loadFile(file)
    e.target.value = ''
  }

  // ── Camera capture ────────────────────────────────────────────────────────────

  function toggleCameraMode() {
    setValidationError(null)
    setMode((m) => (m === 'camera' ? 'edit' : 'camera'))
  }

  // ── Crop callbacks ────────────────────────────────────────────────────────────

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  // ── Rotation ──────────────────────────────────────────────────────────────────

  function rotateLeft() {
    setRotation((r) => (r - 90 + 360) % 360)
  }

  function rotateRight() {
    setRotation((r) => (r + 90) % 360)
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return

    setIsSaving(true)
    setValidationError(null)

    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      onSave(file)
      onOpenChange(false)
    } catch {
      setValidationError('Failed to process the image. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Zoom % label ──────────────────────────────────────────────────────────────

  const zoomPct = Math.round(((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100)

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {/*
       * DialogContent renders its own Portal + Backdrop internally.
       * We override max-w-lg → max-w-2xl for the wider photo editor layout.
       * showCloseButton=false so we render our own header close button.
       */}
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleFileInputChange}
        />

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Update Profile Picture
          </DialogTitle>
          <DialogClose
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        {/* ── Crop / Preview area ────────────────────────────────── */}
        <div className="relative h-72 w-full overflow-hidden rounded-xl border border-input bg-muted/40">
          {mode === 'camera' ? (
            <CameraCapture onCapture={(file) => void loadFile(file)} />
          ) : hasImage ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              classes={{ containerClassName: 'rounded-xl' }}
            />
          ) : (
            <CropEmptyState />
          )}
        </div>

        {/* ── Editing controls ───────────────────────────────────── */}
        <div className="mt-5 flex flex-wrap items-end gap-5">
          {/* Rotation buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Rotation
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={editingDisabled}
                onClick={rotateLeft}
                aria-label="Rotate left 90°"
                className="flex size-10 items-center justify-center rounded-lg border border-input bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                disabled={editingDisabled}
                onClick={rotateRight}
                aria-label="Rotate right 90°"
                className="flex size-10 items-center justify-center rounded-lg border border-input bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCw className="size-4" />
              </button>
            </div>
          </div>

          {/* Zoom slider */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Zoom
              </span>
              <span className="rounded-md border border-input bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                {zoomPct}&thinsp;%
              </span>
            </div>
            <Slider
              value={zoom}
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              onChange={setZoom}
              disabled={editingDisabled}
              aria-label="Zoom level"
            />
          </div>
        </div>

        {/* ── Validation error ───────────────────────────────────── */}
        {validationError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}

        {/* ── Action row ────────────────────────────────────────── */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
            <Upload className="size-3.5" />
            Upload New Photo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={toggleCameraMode}>
            <Camera className="size-3.5" />
            {mode === 'camera' ? 'Back to Editor' : 'Take Photo'}
          </Button>

          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={editingDisabled || isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {/* ── Do's and Don'ts ────────────────────────────────────── */}
        <div className="mt-5 border-t border-border pt-5">
          <PhotoGuidelines />
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
