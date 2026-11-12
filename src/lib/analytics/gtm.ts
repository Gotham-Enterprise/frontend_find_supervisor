/**
 * Google Tag Manager wiring.
 *
 * The container is shared with the job finder site for now (GTM-WH3C8CVS);
 * conversion tags and triggers live in the GTM UI, the app only loads the
 * container and pushes a few named events to the dataLayer.
 *
 * Loading is gated so local/staging traffic doesn't pollute production
 * analytics: the container loads in production builds by default, and in any
 * environment where NEXT_PUBLIC_GTM_ID is set explicitly (handy for testing
 * with GTM Preview on localhost).
 */
const DEFAULT_GTM_ID = 'GTM-WH3C8CVS'

export const GTM_ID: string | null =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
  (process.env.NODE_ENV === 'production' ? DEFAULT_GTM_ID : null)

/**
 * Custom dataLayer events GTM triggers listen for. Keep names stable: they're
 * referenced in the GTM UI. One event per signup entry point so each can be
 * its own conversion, mirroring the job finder's
 * `employer_full_registration_success` / `jobseeker_full_registration_success`.
 */
export const GTM_EVENTS = {
  SUPERVISOR_SIGNUP_SUCCESS: 'supervisor_full_registration_success',
  SUPERVISEE_SIGNUP_SUCCESS: 'supervisee_full_registration_success',
  MEDICAL_DIRECTOR_SIGNUP_SUCCESS: 'medical_director_full_registration_success',
  NEED_MEDICAL_DIRECTOR_SIGNUP_SUCCESS: 'need_medical_director_full_registration_success',
} as const

export type GtmEventName = (typeof GTM_EVENTS)[keyof typeof GTM_EVENTS]

/** Maps each signup form variant to its GTM event. */
export const SIGNUP_GTM_EVENT: Record<
  'supervisor' | 'medical-director' | 'supervisee' | 'need-medical-director',
  GtmEventName
> = {
  supervisor: GTM_EVENTS.SUPERVISOR_SIGNUP_SUCCESS,
  'medical-director': GTM_EVENTS.MEDICAL_DIRECTOR_SIGNUP_SUCCESS,
  supervisee: GTM_EVENTS.SUPERVISEE_SIGNUP_SUCCESS,
  'need-medical-director': GTM_EVENTS.NEED_MEDICAL_DIRECTOR_SIGNUP_SUCCESS,
}

type DataLayerEntry = { event: GtmEventName } & Record<
  string,
  string | number | boolean | undefined
>

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

/**
 * Push a named event to the GTM dataLayer. Safe to call anywhere: no-ops on
 * the server, and still records the event if the container hasn't loaded yet
 * (GTM drains whatever is already in the array when it initialises).
 *
 * Never put PII (email, name, license numbers) in the payload.
 */
export function pushGtmEvent(entry: DataLayerEntry): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(entry)
}
