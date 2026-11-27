/**
 * Picking files for an activity log entry. Mirrors the backend's limits
 * (`attachmentLimits` on the log): JPG, PNG or PDF, 10 MB each, 5 per entry
 * counting the files already on it.
 */

export interface AttachmentLimits {
  perEntry: number
  maxMb: number
  types: string[]
}

export const DEFAULT_ATTACHMENT_LIMITS: AttachmentLimits = {
  perEntry: 5,
  maxMb: 10,
  types: ['image/jpeg', 'image/png', 'application/pdf'],
}

export interface PickResult {
  /** The selection after adding what fits. */
  files: File[]
  /** Why something was left out, or null. */
  problem: string | null
}

/** Same name and size = the same file picked twice. */
const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size

/**
 * Adds `incoming` to `current`, skipping files of the wrong type, over the
 * size limit, already picked, or beyond the room left on the entry
 * (`room` = limit minus the files the entry keeps). One message covers the
 * last problem hit, which is what the picker shows.
 */
export function pickAttachmentFiles(
  current: File[],
  incoming: Iterable<File>,
  room: number,
  limits: AttachmentLimits = DEFAULT_ATTACHMENT_LIMITS,
): PickResult {
  const files = [...current]
  let problem: string | null = null
  for (const file of incoming) {
    if (files.length >= room) {
      problem =
        room < limits.perEntry
          ? `This entry has room for ${Math.max(room, 0)} more file${room === 1 ? '' : 's'}.`
          : `You can attach up to ${limits.perEntry} file${limits.perEntry === 1 ? '' : 's'} to an entry.`
      break
    }
    if (!limits.types.includes(file.type)) {
      problem = `${file.name} isn't a JPG, PNG or PDF.`
      continue
    }
    if (file.size > limits.maxMb * 1024 * 1024) {
      problem = `${file.name} is over ${limits.maxMb} MB.`
      continue
    }
    if (files.some((f) => sameFile(f, file))) continue
    files.push(file)
  }
  return { files, problem }
}

/** "1.2 MB" / "480 KB" */
export function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const isImageType = (type: string) => type.startsWith('image/')
