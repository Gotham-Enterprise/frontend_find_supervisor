'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const LINE_CLAMP_CLASSES: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
}

type ExpandableTextProps = {
  children: string
  maxLines?: 1 | 2 | 3 | 4
  className?: string
}

export function ExpandableText({ children, maxLines = 3, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return

    function measure() {
      const node = textRef.current
      if (!node || expanded) return
      setCanExpand(node.scrollHeight > node.clientHeight + 1)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children, expanded, maxLines])

  const clampClass = LINE_CLAMP_CLASSES[maxLines] ?? 'line-clamp-3'
  const showToggle = canExpand || expanded

  return (
    <div>
      <p
        ref={textRef}
        className={cn(
          'text-xs leading-relaxed text-muted-foreground',
          !expanded && clampClass,
          className,
        )}
      >
        {children}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}
