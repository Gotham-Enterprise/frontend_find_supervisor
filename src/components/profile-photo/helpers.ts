import type { CropArea } from './types'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from './types'

// ─── Image loading ─────────────────────────────────────────────────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Failed to load image')))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

/**
 * Converts a File to a base64 data-URL string so it can be passed to
 * react-easy-crop as the `image` prop. Data URLs don't need revocation like
 * blob URLs do.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string))
    reader.addEventListener('error', () => reject(new Error('Failed to read file')))
    reader.readAsDataURL(file)
  })
}

// ─── Canvas crop + rotate ──────────────────────────────────────────────────────

const TO_RADIANS = Math.PI / 180

/**
 * Produces a cropped, rotated JPEG `File` from a source image data-URL.
 *
 * Algorithm:
 *  1. Draw the image on a "safe area" canvas large enough to hold any rotation
 *     without clipping (diagonal × 2).
 *  2. Apply the rotation transform around the centre.
 *  3. Extract `pixelCrop` from the rotated canvas.
 *  4. Export as JPEG (quality 0.92) and wrap in a `File`.
 *
 * This function is intentionally synchronous-ish (single async boundary) and
 * has no external dependencies beyond the browser Canvas API.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
  outputFileName = 'profile-photo.jpg',
): Promise<File> {
  const image = await createImage(imageSrc)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is not available in this browser.')

  // Safe area is large enough so that after any rotation the full image is visible.
  const maxDim = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxDim / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  // Rotate around the centre of the safe area.
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate(rotation * TO_RADIANS)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  // Draw the image centred in the safe area.
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2)

  // Read the full rotated pixel data.
  const rotatedData = ctx.getImageData(0, 0, safeArea, safeArea)

  // Resize the canvas to the final crop dimensions and paste the crop slice.
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    rotatedData,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas produced an empty blob. Please try a different image.'))
          return
        }
        resolve(new File([blob], outputFileName, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  })
}

// ─── File validation ───────────────────────────────────────────────────────────

export type FileValidationResult = { valid: true } | { valid: false; error: string }

/**
 * Validates a file before loading it into the editor.
 * Checks type and size; returns a user-friendly error string on failure.
 */
export function validateImageFile(file: File): FileValidationResult {
  const isValidType = ACCEPTED_IMAGE_TYPES.includes(
    file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
  )

  if (!isValidType) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload a JPG, PNG, or WEBP image.',
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image is too large. Please choose a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
    }
  }

  return { valid: true }
}
