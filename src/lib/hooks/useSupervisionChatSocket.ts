'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'

import { getOrCreateSupervisionSocket } from '@/lib/socket/supervisionSocket'
import type {
  ChatMessage,
  Conversation,
  SocketDeliveredPayload,
  SocketMessagingStatusPayload,
  SocketNewMessage,
  SocketNotification,
  SocketReadPayload,
  SocketTypingPayload,
  SocketUnreadCount,
} from '@/types/chat'

import { chatKeys } from './useChat'

/**
 * Tracks which users are currently typing per conversation.
 * Map<conversationId, Set<userId>>
 */
type TypingMap = Map<string, Set<string>>

/**
 * Tracks realtime messaging-disabled status per userId.
 * Map<userId, { canMessage: boolean; disabledMessageInfo: string | null }>
 */
export type MessagingStatusMap = Map<
  string,
  { canMessage: boolean; disabledMessageInfo: string | null }
>

interface UseSupervisionChatSocketOptions {
  /** Pass true when the current user is a SUPERVISOR so incoming messages are
   *  locked client-side until the backend override arrives. */
  isSupervisor?: boolean
  /** Current user's ID — used to avoid locking the supervisor's own sent messages. */
  currentUserId?: string
}

interface UseSupervisionChatSocketReturn {
  isConnected: boolean
  typingUsers: TypingMap
  messagingStatus: MessagingStatusMap
  joinConversation: (conversationId: string) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
}

export function useSupervisionChatSocket({
  isSupervisor = false,
  currentUserId,
}: UseSupervisionChatSocketOptions = {}): UseSupervisionChatSocketReturn {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket>(getOrCreateSupervisionSocket())
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingMap>(new Map())
  const [messagingStatus, setMessagingStatus] = useState<MessagingStatusMap>(new Map())

  // Keep latest option values in refs so the stable useEffect closure always
  // reads the current values without needing them as dependencies.
  const isSupervisorRef = useRef(isSupervisor)
  const currentUserIdRef = useRef(currentUserId)
  useEffect(() => {
    isSupervisorRef.current = isSupervisor
    currentUserIdRef.current = currentUserId
  })

  // Typing emit debounce
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── connect + register global listeners once ────────────────────────────
  useEffect(() => {
    const socket = socketRef.current

    if (!socket.connected) {
      socket.connect()
    }

    function onConnect() {
      setIsConnected(true)
      socket.emit('join:supervision_notifications')
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onError(err: unknown) {
      const msg =
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : 'Messaging service error'

      // Auth errors shown as toasts; access/upgrade errors are handled per-send
      if (
        msg.includes('Authentication failed') ||
        msg.includes('Access denied') ||
        msg.includes('not found')
      ) {
        toast.error(msg)
      }
    }

    function onUnreadCount({ count }: SocketUnreadCount) {
      // Update whichever conversation's unreadCount the server is reporting.
      // The server sends this after a new message arrives in the current conversation room.
      // Since we don't know which conversation it belongs to here, we invalidate the list.
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      void count // suppress unused-var lint
    }

    function onNotification(payload: SocketNotification) {
      // Update conversation list preview + unread badge optimistically
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old) => {
        if (!old) return old
        return old.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessagePreview: payload.preview,
                unreadCount: payload.unreadCount,
                lastMessageAt: new Date().toISOString(),
              }
            : c,
        )
      })
    }

    function onNewMessage(msg: SocketNewMessage) {
      const queryKey = chatKeys.messages(msg.conversationId)

      queryClient.setQueryData<ChatMessage[]>(queryKey, (old) => {
        if (!old) return old

        // If this message ID already exists but arrives again as locked=true
        // (supervisor's personal room overriding the shared-room broadcast),
        // update it to the locked version.
        const existing = old.find((m) => m.id === msg.id)
        if (existing) {
          if (msg.locked && !existing.locked) {
            return old.map((m) => (m.id === msg.id ? { ...m, body: null, locked: true } : m))
          }
          return old
        }

        // Replace any lingering optimistic message for the same content.
        // Match by body only (not senderId) because the optimistic entry uses
        // '__me__' while the real socket message carries the actual user ID.
        const withoutOptimistic = old.filter(
          (m) => !(m.id.startsWith('optimistic-') && m.body === msg.body),
        )
        // Lock incoming messages for an unpaid supervisor (isSupervisor=true means
        // the conversation.locked flag was true, i.e. the supervisor hasn't upgraded).
        // Never lock the supervisor's own sent messages.
        const isOwnMessage = msg.senderId === currentUserIdRef.current || msg.senderId === '__me__'
        const shouldLock = msg.locked === true || (isSupervisorRef.current && !isOwnMessage)

        const newMessage: ChatMessage = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          messageType: 'TEXT',
          body: shouldLock ? null : msg.body,
          preview: msg.preview,
          locked: shouldLock,
          isRead: false,
          readAt: null,
          deliveredAt: null,
          createdAt: msg.createdAt,
          updatedAt: msg.createdAt,
        }

        return [...withoutOptimistic, newMessage]
      })

      // Refresh conversation list preview
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    }

    function onDelivered(payload: SocketDeliveredPayload) {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(payload.conversationId), (old) => {
        if (!old) return old
        return old.map((m) =>
          m.id === payload.messageId ? { ...m, deliveredAt: payload.deliveredAt } : m,
        )
      })
    }

    function onRead(payload: SocketReadPayload) {
      // Mark all messages as read and ensure deliveredAt is set (read implies delivered)
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(payload.conversationId), (old) => {
        if (!old) return old
        const now = new Date().toISOString()
        return old.map((m) => ({
          ...m,
          isRead: true,
          readAt: m.readAt ?? now,
          deliveredAt: m.deliveredAt ?? now,
        }))
      })
    }

    function onTyping(payload: SocketTypingPayload) {
      setTypingUsers((prev) => {
        const next = new Map(prev)
        const users = new Set(next.get(payload.conversationId) ?? [])
        if (payload.isTyping) {
          users.add(payload.userId)
        } else {
          users.delete(payload.userId)
        }
        next.set(payload.conversationId, users)
        return next
      })
    }

    function onMessagingStatus(payload: SocketMessagingStatusPayload) {
      setMessagingStatus((prev) => {
        const next = new Map(prev)
        next.set(payload.userId, {
          canMessage: payload.canMessage,
          disabledMessageInfo: payload.disabledMessageInfo ?? null,
        })
        return next
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('error', onError)
    socket.on('supervision:message:unread_count', onUnreadCount)
    socket.on('supervision:notification:new', onNotification)
    socket.on('supervision:message:new', onNewMessage)
    socket.on('supervision:message:delivered', onDelivered)
    socket.on('supervision:message:read', onRead)
    socket.on('supervision:message:typing', onTyping)
    socket.on('supervision:user:messaging_status', onMessagingStatus)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('error', onError)
      socket.off('supervision:message:unread_count', onUnreadCount)
      socket.off('supervision:notification:new', onNotification)
      socket.off('supervision:message:new', onNewMessage)
      socket.off('supervision:message:delivered', onDelivered)
      socket.off('supervision:message:read', onRead)
      socket.off('supervision:message:typing', onTyping)
      socket.off('supervision:user:messaging_status', onMessagingStatus)
    }
  }, [queryClient])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current.emit('join:supervision_messages', conversationId)
  }, [])

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      socketRef.current.emit('supervision:message:typing', { isTyping: true })
      // Auto-send stop after 2s of silence
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('supervision:message:typing', { isTyping: false })
        typingTimeoutRef.current = null
      }, 2000)
    } else {
      socketRef.current.emit('supervision:message:typing', { isTyping: false })
    }

    void conversationId // the server infers it from the room
  }, [])

  return { isConnected, typingUsers, messagingStatus, joinConversation, sendTyping }
}
