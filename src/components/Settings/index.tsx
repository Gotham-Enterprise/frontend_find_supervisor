'use client'

import { AlertCircle, Bell, Eye, Mail, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { UpdateSupervisionSettingsPayload } from '@/lib/api/supervision-settings'
import { isSupervisorRole } from '@/lib/auth/roles'
import {
  useSupervisionSettings,
  useUpdateSupervisionSettings,
  useUser,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-9 rounded-full shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function SettingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="max-w-xl border-destructive/40 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="font-medium text-sm">Failed to load settings</p>
          <p className="text-xs text-muted-foreground mt-1">
            We could not retrieve your settings. Please try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Setting row ──────────────────────────────────────────────────────────────

interface SettingRowProps {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled: boolean
  helperText?: string | null
}

function SettingRow({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  helperText,
}: SettingRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-muted-foreground">{icon}</span>
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium leading-snug">
              {label}
            </Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="shrink-0"
        />
      </div>
      {helperText && (
        <p className="ml-8 text-xs text-amber-600 dark:text-amber-400">{helperText}</p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type SettingsField = 'notificationAlert' | 'canMessage' | 'emailAlert' | 'hideProfile'

export function SettingsPanel() {
  const { user } = useUser()
  const isSupervisor = isSupervisorRole(user?.role)

  const { data: settings, isLoading, isError, refetch } = useSupervisionSettings()
  const { mutateAsync, isPending } = useUpdateSupervisionSettings()
  const { showError } = useUserSnackbar()

  const [optimistic, setOptimistic] = useState<Partial<Record<SettingsField, boolean>>>({})

  // State for the "disable messaging" confirmation modal
  const [disableMessageOpen, setDisableMessageOpen] = useState(false)
  const [disabledMessageInfo, setDisabledMessageInfo] = useState('')

  function getValue(field: SettingsField): boolean {
    if (field in optimistic) return optimistic[field]!
    if (field === 'hideProfile') return settings?.hideProfile ?? false
    return settings?.[field] ?? false
  }

  async function applyToggle(
    field: SettingsField,
    next: boolean,
    extra?: Pick<UpdateSupervisionSettingsPayload, 'disabledMessageInfo'>,
  ) {
    const prev = getValue(field)
    setOptimistic((o) => ({ ...o, [field]: next }))

    const payload: UpdateSupervisionSettingsPayload = {
      notificationAlert: getValue('notificationAlert'),
      canMessage: getValue('canMessage'),
      emailAlert: getValue('emailAlert'),
      ...(isSupervisor ? { hideProfile: getValue('hideProfile') } : {}),
      [field]: next,
      ...extra,
    }

    try {
      await mutateAsync(payload)
      setOptimistic({})
    } catch (error) {
      setOptimistic((o) => ({ ...o, [field]: prev }))
      showError(parseApiError(error))
    }
  }

  function handleToggle(field: SettingsField) {
    const next = !getValue(field)

    // Disabling messaging requires a reason — open the confirmation modal instead
    if (field === 'canMessage' && !next) {
      setDisabledMessageInfo('')
      setDisableMessageOpen(true)
      return
    }

    void applyToggle(field, next)
  }

  async function handleConfirmDisableMessage() {
    setDisableMessageOpen(false)
    await applyToggle('canMessage', false, { disabledMessageInfo: disabledMessageInfo.trim() })
    setDisabledMessageInfo('')
  }

  if (isLoading) return <SettingsSkeleton />
  if (isError) return <SettingsError onRetry={() => refetch()} />

  return (
    <>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Notification &amp; Privacy Settings</CardTitle>
          <CardDescription>
            Control how you receive alerts and who can interact with you.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <SettingRow
            id="notificationAlert"
            icon={<Bell className="h-4 w-4" />}
            label="Push Notifications"
            description="Receive in-app alerts for new activity on your account."
            checked={getValue('notificationAlert')}
            onCheckedChange={() => handleToggle('notificationAlert')}
            disabled={isPending}
          />

          <SettingRow
            id="emailAlert"
            icon={<Mail className="h-4 w-4" />}
            label="Email Alerts"
            description="Get important updates and activity summaries via email."
            checked={getValue('emailAlert')}
            onCheckedChange={() => handleToggle('emailAlert')}
            disabled={isPending}
          />

          <SettingRow
            id="canMessage"
            icon={<MessageCircle className="h-4 w-4" />}
            label="Allow Messaging"
            description="Let other users send you direct messages."
            checked={getValue('canMessage')}
            onCheckedChange={() => handleToggle('canMessage')}
            disabled={isPending}
            helperText={!getValue('canMessage') ? settings?.disabledMessageInfo : null}
          />

          {isSupervisor && (
            <SettingRow
              id="hideProfile"
              icon={<Eye className="h-4 w-4" />}
              label="Hide Profile"
              description="When enabled, your profile will not appear in search results."
              checked={getValue('hideProfile')}
              onCheckedChange={() => handleToggle('hideProfile')}
              disabled={isPending}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={disableMessageOpen}
        onOpenChange={(open) => {
          if (!open) setDisabledMessageInfo('')
          setDisableMessageOpen(open)
        }}
        title="Disable Messaging"
        description="Please provide a reason that will be shown to users who try to message you."
        confirmLabel="Disable Messaging"
        confirmDisabled={disabledMessageInfo.trim().length === 0}
        isPending={isPending}
        onConfirm={() => void handleConfirmDisableMessage()}
      >
        <Textarea
          placeholder="e.g. Not accepting new supervisees at this time."
          value={disabledMessageInfo}
          onChange={(e) => setDisabledMessageInfo(e.target.value)}
          rows={3}
        />
      </ConfirmDialog>
    </>
  )
}
