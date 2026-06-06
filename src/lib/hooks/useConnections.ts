'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveConnection,
  cancelConnection,
  checkConnectionAvailability,
  declineConnection,
  getReceivedConnections,
  getSentConnections,
  makeConnection,
  type MakeConnectionPayload,
} from '@/lib/api/connections'

export const connectionKeys = {
  all: ['connections'] as const,
  check: (receiverId: string, email: string) =>
    [...connectionKeys.all, 'check', receiverId, email] as const,
  received: (page: number, limit: number, status: string) =>
    [...connectionKeys.all, 'received', page, limit, status] as const,
  sent: (page: number, limit: number, status: string) =>
    [...connectionKeys.all, 'sent', page, limit, status] as const,
}

// ─── Check availability ────────────────────────────────────────────────────────

/**
 * Checks whether a connection request can be sent to the given supervisee.
 * Only enabled when both receiverId and requesterEmail are provided.
 */
export function useCheckConnectionAvailability(
  receiverId: string | null | undefined,
  requesterEmail: string | null | undefined,
) {
  return useQuery({
    queryKey:
      receiverId && requesterEmail
        ? connectionKeys.check(receiverId, requesterEmail)
        : (['connections', 'check', 'disabled'] as const),
    queryFn: () => checkConnectionAvailability(receiverId!, requesterEmail!),
    enabled: !!receiverId && !!requesterEmail,
    staleTime: 60 * 1000,
    retry: false,
  })
}

// ─── Send request ──────────────────────────────────────────────────────────────

/** Mutation hook for POST /supervision/connections/request. */
export function useMakeConnection() {
  return useMutation({
    mutationFn: (payload: MakeConnectionPayload) => makeConnection(payload),
  })
}

// ─── Received connections (supervisee) ────────────────────────────────────────

export function useReceivedConnections(page = 1, limit = 10, status = '') {
  return useQuery({
    queryKey: connectionKeys.received(page, limit, status),
    queryFn: () => getReceivedConnections(page, limit, status),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

// ─── Sent connections (supervisor) ────────────────────────────────────────────

export function useSentConnections(page = 1, limit = 10, status = '') {
  return useQuery({
    queryKey: connectionKeys.sent(page, limit, status),
    queryFn: () => getSentConnections(page, limit, status),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

// ─── Approve ──────────────────────────────────────────────────────────────────

export function useApproveConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => approveConnection(connectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    },
  })
}

// ─── Decline ──────────────────────────────────────────────────────────────────

export function useDeclineConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      connectionId,
      declineReason,
    }: {
      connectionId: string
      declineReason?: string
    }) => declineConnection(connectionId, declineReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    },
  })
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export function useCancelConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => cancelConnection(connectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    },
  })
}
