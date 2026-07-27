'use client'

import { AlertCircle, Camera, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CameraCaptureProps = {
  /** Called with the captured frame as a JPEG File. */
  onCapture: (file: File) => void
}

type CameraStatus = 'starting' | 'ready' | 'error'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cameraErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera access was denied. Please allow camera access in your browser settings and try again.'
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera was found on this device.'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'The camera is already in use by another application.'
    }
  }
  return 'Could not start the camera. Please try again or upload a photo instead.'
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Live webcam preview with a shutter button. Requests the user-facing camera
 * on mount and stops all tracks on unmount. The preview is mirrored (selfie
 * style) and the captured frame is mirrored to match what the user sees.
 */
export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<CameraStatus>('starting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        setErrorMessage('Camera capture is not supported in this browser.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          // play() rejects with AbortError if the element unmounts mid-start
          await video.play().catch(() => undefined)
        }
        if (!cancelled) setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage(cameraErrorMessage(err))
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  function handleCapture() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror horizontally so the output matches the mirrored on-screen preview
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-foreground">Camera unavailable</p>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full -scale-x-100 object-cover"
      />

      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
          <Loader2 className="size-6 animate-spin text-white" aria-hidden />
          <p className="text-xs text-white/80">Starting camera…</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            aria-label="Capture photo"
            className="flex size-14 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Camera className="size-6" />
          </button>
        </div>
      )}
    </div>
  )
}
