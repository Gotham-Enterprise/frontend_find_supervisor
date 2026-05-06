'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { StarRatingInput } from '@/components/reviews/StarRatingInput'
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
import { Textarea } from '@/components/ui/textarea'
import { useCreateReview, useUpdateReview, useUserSnackbar } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import type { Review } from '@/types/review'

// ─── Schema ───────────────────────────────────────────────────────────────────

const leaveReviewSchema = z.object({
  rating: z
    .number({ error: 'Rating is required' })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(1, 'Comment is required'),
})

type LeaveReviewFormValues = z.infer<typeof leaveReviewSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeaveReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hireId: string
  supervisorName: string
  existingReview?: Review
  /**
   * When true (e.g. immediately after marking supervision complete), shows “Skip for now”
   * instead of Cancel so the supervisee can dismiss without submitting a review.
   */
  allowSkip?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaveReviewModal({
  open,
  onOpenChange,
  hireId,
  supervisorName,
  existingReview,
  allowSkip = false,
}: LeaveReviewModalProps) {
  const isEditMode = !!existingReview

  const { showSuccess, showError } = useUserSnackbar()
  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()

  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<LeaveReviewFormValues>({
    resolver: zodResolver(leaveReviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? '',
    },
  })

  // Reset form whenever the modal opens, pre-filling with existing data if editing
  useEffect(() => {
    if (open) {
      form.reset({
        rating: existingReview?.rating ?? 0,
        comment: existingReview?.comment ?? '',
      })
    }
  }, [open, existingReview, form])

  function handleSubmit(values: LeaveReviewFormValues) {
    if (isEditMode && existingReview) {
      updateMutation.mutate(
        {
          reviewId: existingReview.id,
          payload: { rating: values.rating, comment: values.comment },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            showSuccess('Review updated successfully.')
          },
          onError: (err) => {
            showError(parseApiError(err))
          },
        },
      )
    } else {
      createMutation.mutate(
        { hireId, rating: values.rating, comment: values.comment },
        {
          onSuccess: () => {
            onOpenChange(false)
            showSuccess('Review submitted successfully.')
          },
          onError: (err) => {
            showError(parseApiError(err))
          },
        },
      )
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>{isEditMode ? 'Edit Review' : 'Leave a Review'}</DialogTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode
            ? `Update your review for ${supervisorName}.`
            : allowSkip
              ? `Supervision with ${supervisorName} is marked complete. Optionally leave a review now, or skip — you can add one anytime from this hire card.`
              : `Share your experience with ${supervisorName}.`}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-5 space-y-5">
            {/* Star rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your review here…"
                      rows={4}
                      disabled={isPending}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                {allowSkip && !isEditMode ? 'Skip for now' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting…' : isEditMode ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
