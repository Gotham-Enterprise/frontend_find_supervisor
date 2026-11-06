import axios from 'axios'

/**
 * Internal test accounts (backend `SupervisionUser.isTestAccount`) can browse
 * live profiles, but the backend blocks any hire / connection between a test
 * account and a live one. The UI warns before the user gets that far.
 */

/** `errorCode` the backend sends with its 403 for a test ↔ live interaction. */
export const TEST_ACCOUNT_INTERACTION_ERROR_CODE = 'TEST_ACCOUNT_INTERACTION'

type MaybeTestAccount = { isTestAccount?: boolean | null } | null | undefined

/** True when a signed-in test account is about to act on a live account. */
export function isTestToLiveInteraction(viewer: MaybeTestAccount, target: MaybeTestAccount) {
  return viewer?.isTestAccount === true && target?.isTestAccount !== true
}

/** True for the backend's 403 rejecting a test ↔ live interaction. */
export function isTestAccountInteractionError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const data = error.response?.data as { errorCode?: string } | undefined
  return data?.errorCode === TEST_ACCOUNT_INTERACTION_ERROR_CODE
}
