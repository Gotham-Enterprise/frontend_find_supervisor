// ─── Crop / edit state ────────────────────────────────────────────────────────

export type CropPosition = { x: number; y: number }

/**
 * Pixel-accurate rectangle returned by react-easy-crop's onCropComplete.
 * Mirrors the library's `Area` type so callers never need to import it.
 */
export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

// ─── Validation constants ─────────────────────────────────────────────────────

/** Accepted MIME types for profile photos. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

/** Maximum allowed file size: 5 MB */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

/** Human-readable size label shown in helper text / error messages. */
export const MAX_FILE_SIZE_LABEL = '5 MB'

// ─── Zoom range ───────────────────────────────────────────────────────────────

export const ZOOM_MIN = 1
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.01
