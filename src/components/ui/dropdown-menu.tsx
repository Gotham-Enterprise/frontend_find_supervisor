'use client'

import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import * as React from 'react'

import { cn } from '@/lib/utils'

const DropdownMenuRoot = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger
const DropdownMenuPortal = MenuPrimitive.Portal

function DropdownMenuPositioner({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Positioner>) {
  return (
    <MenuPrimitive.Positioner
      className={cn('z-50', className)}
      side="bottom"
      align="end"
      sideOffset={4}
      {...props}
    />
  )
}

function DropdownMenuPopup({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Popup
      className={cn(
        'min-w-[8rem] overflow-hidden rounded-md border border-border bg-background p-1 shadow-md',
        'data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
        'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { destructive?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive ? 'text-destructive data-[highlighted]:bg-destructive/10' : 'text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn('-mx-1 my-1 h-px bg-border', className)} />
}

export {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
