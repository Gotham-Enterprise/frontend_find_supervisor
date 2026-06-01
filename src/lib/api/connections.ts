import type {
  ApproveConnectionResult,
  CheckAvailabilityResult,
  ConnectionListResult,
  ConnectionRequest,
  PaginationMeta,
} from '@/types/connections'

import { apiClient } from './client'

/**
 * Payload for POST /supervision/connections/request.
 * Field names match the backend validator exactly.
 */
export interface MakeConnectionPayload {
  /** ID of the supervisee receiving the request. */
  receiverId: string
  name: string
  email: string
  /** Optional — E.164 or display format; backend validates loosely. */
  contactNumber?: string
  message: string
}

export interface ConnectionRecord {
  id: string
  status: string
  senderId: string
  receiverId: string
  createdAt: string
}

interface ConnectionListApiResponse {
  success: boolean
  data: ConnectionRequest[]
  metaData: PaginationMeta
}

interface ConnectionApiResponse<T> {
  success: boolean
  data: T
}

/**
 * POST /supervision/connections/request
 *
 * Sends a connection request from a supervisor (or guest) to a supervisee.
 * The route accepts both authenticated and unauthenticated callers
 * (optionalProtectSupervision), so this may be called with or without a session cookie.
 */
export async function makeConnection(payload: MakeConnectionPayload): Promise<ConnectionRecord> {
  const { data } = await apiClient.post<ConnectionApiResponse<ConnectionRecord>>(
    '/supervision/connections/request',
    payload,
  )
  return data.data
}

/**
 * GET /supervision/connections/check?receiverId=&email=
 *
 * Checks whether a connection request already exists between the requester (by email)
 * and the given receiver (supervisee). No auth required.
 */
export async function checkConnectionAvailability(
  receiverId: string,
  email: string,
): Promise<CheckAvailabilityResult> {
  const { data } = await apiClient.get<ConnectionApiResponse<CheckAvailabilityResult>>(
    '/supervision/connections/check',
    { params: { receiverId, email } },
  )
  return data.data
}

/**
 * GET /supervision/connections/received?page=&limit=&status=
 *
 * Returns paginated connection requests received by the authenticated user (supervisee).
 */
export async function getReceivedConnections(
  page = 1,
  limit = 10,
  status = '',
): Promise<ConnectionListResult> {
  const { data } = await apiClient.get<ConnectionListApiResponse>(
    '/supervision/connections/received',
    { params: { page, limit, status: status || undefined } },
  )
  return { items: data.data, meta: data.metaData }
}

/**
 * GET /supervision/connections/sent?page=&limit=&status=
 *
 * Returns paginated connection requests sent by the authenticated user (supervisor).
 */
export async function getSentConnections(
  page = 1,
  limit = 10,
  status = '',
): Promise<ConnectionListResult> {
  const { data } = await apiClient.get<ConnectionListApiResponse>('/supervision/connections/sent', {
    params: { page, limit, status: status || undefined },
  })
  return { items: data.data, meta: data.metaData }
}

/** PATCH /supervision/connections/:connectionId/approve — supervisee approves a pending request. */
export async function approveConnection(connectionId: string): Promise<ApproveConnectionResult> {
  const { data } = await apiClient.patch<ConnectionApiResponse<ApproveConnectionResult>>(
    `/supervision/connections/${connectionId}/approve`,
  )
  return data.data
}

/** PATCH /supervision/connections/:connectionId/decline — supervisee declines a pending request. */
export async function declineConnection(
  connectionId: string,
  declineReason?: string,
): Promise<ConnectionRequest> {
  const { data } = await apiClient.patch<ConnectionApiResponse<ConnectionRequest>>(
    `/supervision/connections/${connectionId}/decline`,
    { declineReason },
  )
  return data.data
}

/** PATCH /supervision/connections/:connectionId/cancel — supervisor cancels a pending sent request. */
export async function cancelConnection(connectionId: string): Promise<ConnectionRequest> {
  const { data } = await apiClient.patch<ConnectionApiResponse<ConnectionRequest>>(
    `/supervision/connections/${connectionId}/cancel`,
  )
  return data.data
}
