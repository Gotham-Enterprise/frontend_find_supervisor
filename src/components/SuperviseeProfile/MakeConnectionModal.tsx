'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Textarea } from '@/components/ui/textarea'
import { useSupervisorProfile, useUser, useUserSnackbar } from '@/lib/hooks'
import { connectionKeys, useMakeConnection } from '@/lib/hooks/useConnections'
import { parseApiError } from '@/lib/utils/error-parser'
import { getMakeConnectionAccess } from '@/lib/utils/make-connection-access'
import {
  formatUSPhoneForDisplay,
  isValidUSPhoneNumber,
  normalizeUSPhoneNumber,
} from '@/lib/utils/phone'

// ─── Validation ───────────────────────────────────────────────────────────────

const INTRODUCTION_MESSAGE_MAX_LENGTH = 500

const makeConnectionSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .min(2, 'Must be at least 2 characters.')
    .max(100, 'Must not exceed 100 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),
  phoneNumber: z
    .string()
    .trim()
    .max(30, 'Must not exceed 30 characters.')
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || isValidUSPhoneNumber(value), {
      message: 'Please enter a valid US phone number.',
    }),
  introductionMessage: z
    .string()
    .trim()
    .min(1, 'Introduction message is required.')
    .min(10, 'Must be at least 10 characters.')
    .max(
      INTRODUCTION_MESSAGE_MAX_LENGTH,
      `Must not exceed ${INTRODUCTION_MESSAGE_MAX_LENGTH} characters.`,
    ),
})

type MakeConnectionFormValues = z.infer<typeof makeConnectionSchema>

function buildDefaultValues(
  fullName: string,
  email: string,
  phoneNumber: string,
): MakeConnectionFormValues {
  return {
    fullName,
    email,
    phoneNumber,
    introductionMessage: '',
  }
}

function parseConnectionError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Unable to send connection request. Please try again.'
  }

  const status = error.response?.status
  const data = error.response?.data as { error?: string; message?: string } | undefined
  const backendMsg = (typeof data?.error === 'string' ? data.error : data?.message) ?? ''

  if (status === 409 || backendMsg.toLowerCase().includes('already have a pending')) {
    return 'A connection request has already been sent to this professional.'
  }
  if (backendMsg.toLowerCase().includes('already approved')) {
    return 'Your connection request to this professional was already approved.'
  }
  if (status === 403) {
    return 'A platform access plan is required to send connection requests.'
  }
  if (status === 401) {
    return 'Please sign in to send a connection request.'
  }

  return parseApiError(error)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MakeConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  superviseeId: string
  superviseeName: string
  /** Mirrors hero gating — submit is blocked when false to prevent UI bypass. */
  canAccess: boolean
}

export function MakeConnectionModal({
  open,
  onOpenChange,
  superviseeId,
  superviseeName,
  canAccess,
}: MakeConnectionModalProps) {
  const { user } = useUser()
  const { data: supervisorProfile, isLoading: supervisorProfileLoading } =
    useSupervisorProfile(open)
  const { showSuccess, showError } = useUserSnackbar()
  const { mutateAsync: sendRequest } = useMakeConnection()
  const queryClient = useQueryClient()

  const access = useMemo(
    () =>
      getMakeConnectionAccess({
        user,
        supervisorProfile,
        profileLoading: supervisorProfileLoading,
      }),
    [user, supervisorProfile, supervisorProfileLoading],
  )

  const canSubmit = canAccess && access.allowed

  const prefilledValues = useMemo(() => {
    const fullName = user?.fullName?.trim() || user?.name?.trim() || ''
    const email = user?.email?.trim() || ''
    const rawPhone = supervisorProfile?.user.contactNumber ?? ''
    const phoneNumber = rawPhone ? formatUSPhoneForDisplay(rawPhone) : ''
    return buildDefaultValues(fullName, email, phoneNumber)
  }, [user, supervisorProfile])

  const form = useForm<MakeConnectionFormValues>({
    resolver: zodResolver(makeConnectionSchema),
    defaultValues: prefilledValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(prefilledValues)
    }
  }, [open, prefilledValues, form])

  const isLoggedIn = Boolean(user)
  const isSubmitting = form.formState.isSubmitting
  const contactFieldsDisabled = isLoggedIn || isSubmitting

  async function onSubmit(values: MakeConnectionFormValues) {
    if (!canSubmit) {
      showError('Make A Connection requires an active subscription.')
      onOpenChange(false)
      return
    }

    const phone = values.phoneNumber?.trim()
    const normalizedPhone = phone ? (normalizeUSPhoneNumber(phone) ?? phone) : undefined

    try {
      await sendRequest({
        receiverId: superviseeId,
        name: values.fullName.trim(),
        email: values.email.trim(),
        contactNumber: normalizedPhone,
        message: values.introductionMessage.trim(),
      })

      // Invalidate the check query so the profile button updates to "Request Sent"
      const email = values.email.trim()
      await queryClient.invalidateQueries({
        queryKey: connectionKeys.check(superviseeId, email),
      })

      showSuccess('Connection request sent successfully.')
      onOpenChange(false)
      form.reset(prefilledValues)
    } catch (error) {
      showError(parseConnectionError(error))
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogTitle className="mb-1">Make a Connection</DialogTitle>
        <p className="mb-5 text-sm text-muted-foreground">
          Send a short introduction so {superviseeName} can review your connection request.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInputField
              control={form.control}
              name="fullName"
              label="Full Name"
              required
              autoCapitalizePersonName
              autoComplete="name"
              disabled={contactFieldsDisabled}
              isSubmitting={isSubmitting}
              placeholder="Your full name"
            />

            <FormInputField
              control={form.control}
              name="email"
              label="Email Address"
              required
              type="email"
              autoComplete="email"
              disabled={contactFieldsDisabled}
              isSubmitting={isSubmitting}
              placeholder="you@example.com"
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      value={field.value ?? ''}
                      disabled={contactFieldsDisabled}
                      placeholder="(555) 000-0000"
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="introductionMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Introduction Message <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="Briefly introduce yourself and explain why you'd like to connect."
                      className="min-h-28"
                      maxLength={INTRODUCTION_MESSAGE_MAX_LENGTH}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {(field.value ?? '').length} / {INTRODUCTION_MESSAGE_MAX_LENGTH} characters
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Sending…' : 'Send Connection Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
