'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMatchingRequest } from '@/lib/hooks'

const matchingRequestSchema = z.object({
  supervisorId: z.string().min(1, 'Please select a supervisor'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(500),
})

type MatchingRequestFormValues = z.infer<typeof matchingRequestSchema>

interface MatchingRequestFormProps {
  onSuccess?: () => void
}

export function MatchingRequestForm({ onSuccess }: MatchingRequestFormProps) {
  const { mutate: createRequest, isPending } = useCreateMatchingRequest()
  const form = useForm<MatchingRequestFormValues>({
    resolver: zodResolver(matchingRequestSchema),
    defaultValues: { supervisorId: '', message: '' },
  })

  function onSubmit(values: MatchingRequestFormValues) {
    createRequest(values, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="supervisorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter supervisor ID" {...field} />
              </FormControl>
              <FormDescription>Ask your coordinator for the supervisor&apos;s ID.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Introduce yourself and explain why you'd like this supervisor…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  )
}
