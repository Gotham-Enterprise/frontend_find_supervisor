'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import { useConversations } from '@/lib/hooks/useChat'
import { getOrCreateSupervisionSocket } from '@/lib/socket/supervisionSocket'
import type { SocketPresencePayload } from '@/types/chat'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserPresence {
  /** true only after at least one supervision:user:presence event has been received */
  known: boolean
  isOnline: boolean
  lastSeenAt: string | null
}

/** Map<userId, UserPresence> */
export type PresenceMap = Map<string, UserPresence>

interface PresenceContextValue {
  presence: PresenceMap
  getPresence: (userId: string) => UserPresence
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PRESENCE: UserPresence = { known: false, isOnline: false, lastSeenAt: null }

// ─── Context ─────────────────────────────────────────────────────────────────

const PresenceContext = createContext<PresenceContextValue | null>(null)

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef(getOrCreateSupervisionSocket())
  const [presence, setPresence] = useState<PresenceMap>(new Map())
  const { data: conversations } = useConversations()
  const { user } = useUser()

  const conversationPeerIds = useMemo(() => {
    if (!conversations?.length || !user?.id) return []
    const isSupervisee = isSuperviseeRole(user.role)
    const ids = new Set<string>()
    for (const c of conversations) {
      const otherId = isSupervisee ? c.supervisor.id : c.supervisee.id
      if (otherId && otherId !== user.id) ids.add(otherId)
    }
    return [...ids]
  }, [conversations, user])

  useEffect(() => {
    if (!user?.id) return

    const socket = socketRef.current

    if (!socket.connected) {
      socket.connect()
    }

    function onPresence(payload: SocketPresencePayload) {
      if (!payload?.userId) return

      setPresence((prev) => {
        const next = new Map(prev)
        next.set(payload.userId, {
          known: true,
          isOnline: payload.isOnline === true,
          lastSeenAt: payload.lastSeenAt ?? null,
        })
        return next
      })
    }

    function onPresenceList(raw: unknown) {
      if (!Array.isArray(raw)) return
      setPresence((prev) => {
        const next = new Map(prev)
        for (const item of raw) {
          if (!item || typeof item !== 'object') continue
          const row = item as Partial<SocketPresencePayload>
          if (!row.userId || typeof row.userId !== 'string') continue
          next.set(row.userId, {
            known: true,
            isOnline: row.isOnline === true,
            lastSeenAt: row.lastSeenAt ?? null,
          })
        }
        return next
      })
    }

    socket.on('supervision:user:presence', onPresence)
    socket.on('supervision:presence:list', onPresenceList)

    return () => {
      socket.off('supervision:user:presence', onPresence)
      socket.off('supervision:presence:list', onPresenceList)
    }
  }, [user?.id])

  /** Initial / refreshed snapshot: peers already online before we subscribed. */
  useEffect(() => {
    if (!user?.id) return

    const socket = socketRef.current
    const requestSnapshot = () => {
      if (conversationPeerIds.length === 0) return
      socket.emit('supervision:presence:get', { userIds: conversationPeerIds })
    }

    socket.on('connect', requestSnapshot)
    if (socket.connected) requestSnapshot()

    return () => {
      socket.off('connect', requestSnapshot)
    }
  }, [user?.id, conversationPeerIds])

  const getPresence = useCallback(
    (userId: string): UserPresence => presence.get(userId) ?? DEFAULT_PRESENCE,
    [presence],
  )

  const value = useMemo(() => ({ presence, getPresence }), [presence, getPresence])

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    throw new Error('usePresence must be used within PresenceProvider')
  }
  return ctx
}
