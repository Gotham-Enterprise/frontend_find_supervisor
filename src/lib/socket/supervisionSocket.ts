'use client'

import { io, type Socket } from 'socket.io-client'

function getSocketOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'
  return base.replace(/\/api.*$/, '')
}

let socketSingleton: Socket | null = null

/** Single /supervision socket.io connection shared by chat and presence. */
export function getOrCreateSupervisionSocket(): Socket {
  if (!socketSingleton) {
    socketSingleton = io(`${getSocketOrigin()}/supervision`, {
      withCredentials: true,
      path: '/socket.io',
      autoConnect: false,
    })
  }
  return socketSingleton
}

/**
 * Closes the supervision socket so the server runs disconnect handlers (presence offline).
 * Call on logout before clearing session; clears the singleton so the next login opens a new connection.
 */
export function disconnectSupervisionSocket(): void {
  if (!socketSingleton) return
  socketSingleton.disconnect()
  socketSingleton = null
}
