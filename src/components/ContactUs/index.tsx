'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, Mail, MessageSquare, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { submitContactUs } from '@/lib/api/supervision'
import { useUser } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

// ─── Schema ───────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .max(100, 'Must not exceed 100 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),
  phone: z.string().trim().max(30, 'Must not exceed 30 characters.').optional().or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required.')
    .max(150, 'Must not exceed 150 characters.'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required.')
    .max(5000, 'Must not exceed 5000 characters.'),
})

type ContactFormValues = z.infer<typeof contactSchema>

// ─── Components ───────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
      <div className="flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <MessageSquare className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Contact Us</h1>
          <p className="max-w-2xl text-sm leading-relaxed opacity-80">
            Have a question or need help? Fill out the form and our team will get back to you as
            soon as possible.
          </p>
        </div>
      </div>
    </div>
  )
}

function SuccessState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">Message Sent!</p>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out. Our team will respond to your message within 1–2 business days.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to Dashboard
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ContactUsPage() {
  const { user } = useUser()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: user?.fullName ?? user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: ContactFormValues) {
    setServerError(null)
    try {
      await submitContactUs({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setServerError(parseApiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <SuccessState />
          ) : (
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base font-semibold">Send us a message</CardTitle>
                <p className="text-sm text-muted-foreground">
                  All fields marked with <span className="text-destructive">*</span> are required.
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInputField
                        control={form.control}
                        name="fullName"
                        label="Full Name"
                        placeholder="Jane Smith"
                        required
                        isSubmitting={isSubmitting}
                      />
                      <FormInputField
                        control={form.control}
                        name="email"
                        label="Email Address"
                        placeholder="jane@example.com"
                        type="email"
                        required
                        isSubmitting={isSubmitting}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormInputField
                        control={form.control}
                        name="subject"
                        label="Subject"
                        placeholder="e.g. Verification question"
                        required
                        isSubmitting={isSubmitting}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Message <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe your question or issue in detail…"
                              rows={6}
                              disabled={isSubmitting}
                              maxLength={5000}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <FormMessage />
                            <span className="ml-auto text-xs text-muted-foreground">
                              {(field.value ?? '').length}/5000
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />

                    {serverError && (
                      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {serverError}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting} className="min-w-32">
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            Sending…
                          </span>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact info sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold">Other ways to reach us</CardTitle>
            </CardHeader>
            <CardContent className="divide-y pt-0">
              <div className="flex items-start gap-3 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@findasupervisor.com</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    We respond within 1–2 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">Mon – Fri, 9 AM – 5 PM EST</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Submissions outside business hours are handled the next business day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-5 space-y-2">
              <p className="text-sm font-semibold">Helpful resources</p>
              <div className="space-y-1.5">
                <Link href="/faq" className="block text-sm text-primary hover:underline">
                  → Browse the FAQ
                </Link>
                <Link
                  href="/verification-guide"
                  className="block text-sm text-primary hover:underline"
                >
                  → Verification Guide
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-start">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
