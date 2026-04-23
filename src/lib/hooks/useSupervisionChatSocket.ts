'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

import type {
  ChatMessage,
  Conversation,
  SocketNewMessage,
  SocketNotification,
  SocketReadPayload,
  SocketTypingPayload,
  SocketUnreadCount,
} from '@/types/chat'

import { chatKeys } from './useChat'

// Derive socket origin from the API base URL (strip trailing /api path)
function getSocketOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'
  // Remove everything from /api onward so we connect to the root origin
  return base.replace(/\/api.*$/, '')
}

/**
 * Tracks which users are currently typing per conversation.
 * Map<conversationId, Set<userId>>
 */
type TypingMap = Map<string, Set<string>>

interface UseSupervisionChatSocketReturn {
  isConnected: boolean
  typingUsers: TypingMap
  joinConversation: (conversationId: string) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
}

// Module-level singleton so multiple component mounts share one socket
let socketSingleton: Socket | null = null

function getOrCreateSocket(): Socket {
  if (!socketSingleton) {
    socketSingleton = io(`${getSocketOrigin()}/supervision`, {
      withCredentials: true,
      path: '/socket.io',
      autoConnect: false,
    })
  }
  return socketSingleton
}

export function useSupervisionChatSocket(): UseSupervisionChatSocketReturn {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket>(getOrCreateSocket())
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingMap>(new Map())

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
        // Dedup: skip if already present (optimistic or previously received)
        if (old.some((m) => m.id === msg.id)) return old
        // Also replace any lingering optimistic message for the same content
        const withoutOptimistic = old.filter(
          (m) =>
            !(m.id.startsWith('optimistic-') && m.body === msg.body && m.senderId === '__me__'),
        )
        const newMessage: ChatMessage = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          messageType: 'TEXT',
          body: msg.body,
          preview: msg.preview,
          locked: false,
          isRead: false,
          readAt: null,
          createdAt: msg.createdAt,
          updatedAt: msg.createdAt,
        }
        return [...withoutOptimistic, newMessage]
      })

      // Refresh conversation list preview
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    }

    function onRead(payload: SocketReadPayload) {
      // Mark all messages as read in this conversation when the other user reads
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(payload.conversationId), (old) => {
        if (!old) return old
        return old.map((m) => ({ ...m, isRead: true, readAt: new Date().toISOString() }))
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

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('error', onError)
    socket.on('supervision:message:unread_count', onUnreadCount)
    socket.on('supervision:notification:new', onNotification)
    socket.on('supervision:message:new', onNewMessage)
    socket.on('supervision:message:read', onRead)
    socket.on('supervision:message:typing', onTyping)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('error', onError)
      socket.off('supervision:message:unread_count', onUnreadCount)
      socket.off('supervision:notification:new', onNotification)
      socket.off('supervision:message:new', onNewMessage)
      socket.off('supervision:message:read', onRead)
      socket.off('supervision:message:typing', onTyping)
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

  return { isConnected, typingUsers, joinConversation, sendTyping }
}
