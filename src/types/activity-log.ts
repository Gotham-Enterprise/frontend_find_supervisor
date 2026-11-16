/** A Medical Director's activity log for a client (never billed). */

export type ActivityType = 'MEETING' | 'CHART_REVIEW' | 'PROTOCOL_REVIEW' | 'CONSULTATION' | 'OTHER'

/** A file on an entry (a signed protocol, an agenda): JPG, PNG or PDF. */
export interface ActivityAttachment {
  id: string
  /** Presigned, valid for 24 hours. */
  url: string
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface ActivityEntry {
  id: string
  /** US Eastern YYYY-MM-DD the activity happened. */
  activityDate: string
  type: ActivityType
  durationMinutes: number | null
  chartCount: number | null
  notes: string | null
  /** US Eastern YYYY-MM-DD the entry was written (shows backdating). */
  loggedOn: string
  createdAt: string
  updatedAt: string
  edited: boolean
  /** Logged after the client reported a problem with its month. */
  addedAfterDispute: boolean
  /** The billed month it falls in (in-app monthly hires). */
  periodId: string | null
  /** In upload order. */
  attachments: ActivityAttachment[]
  /** Medical Director only. */
  canEdit: boolean
  lockedReason: string | null
}

/** GET /supervision/hires/:hireId/activity-log */
export interface HireActivityLog {
  role: 'supervisor' | 'supervisee'
  signed: boolean
  canLog: boolean
  /** Dates the Medical Director can log (US Eastern YYYY-MM-DD). */
  window: { earliestDate: string; latestDate: string }
  /** What the backend accepts per entry. */
  attachmentLimits: { perEntry: number; maxMb: number; types: string[] }
  periods: { id: string; label: string; status: string; disputedAt: string | null }[]
  /** Newest first. */
  entries: ActivityEntry[]
}

export interface ActivityEntryInput {
  activityDate: string
  type: ActivityType
  durationMinutes: number | null
  chartCount: number | null
  notes: string | null
  /** Files to add (sent as multipart "attachments"). */
  attachments?: File[]
  /** Ids of the entry's files to remove (update only). */
  removeAttachmentIds?: string[]
}
