'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { AppNotification } from '@/components/notifications/types'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationsListData,
} from '@/lib/api/notifications'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number, limit: number) => [...notificationKeys.all, 'list', page, limit] as const,
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: () => fetchNotifications(page, limit),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipientId: string) => markNotificationRead(recipientId),

    onMutate: async (recipientId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousData = queryClient.getQueriesData<NotificationsListData>({
        queryKey: notificationKeys.all,
      })

      queryClient.setQueriesData<NotificationsListData>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old
          const wasUnread = old.notifications.some((n) => n.id === recipientId && !n.isRead)
          return {
            ...old,
            totalNotifUnread: wasUnread
              ? Math.max(0, old.totalNotifUnread - 1)
              : old.totalNotifUnread,
            notifications: old.notifications.map(
              (n): AppNotification => (n.id === recipientId ? { ...n, isRead: true } : n),
            ),
          }
        },
      )

      return { previousData }
    },

    onError: (_err, _id, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousData = queryClient.getQueriesData<NotificationsListData>({
        queryKey: notificationKeys.all,
      })

      queryClient.setQueriesData<NotificationsListData>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old
          return {
            ...old,
            totalNotifUnread: 0,
            notifications: old.notifications.map(
              (n): AppNotification => ({
                ...n,
                isRead: true,
              }),
            ),
          }
        },
      )

      return { previousData }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
