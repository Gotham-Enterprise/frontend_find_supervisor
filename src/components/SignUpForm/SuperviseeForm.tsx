'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { superviseeSchema, howSoonOptions, type SuperviseeFormValues } from './schema'
import { superviseeDefaultValues } from './helpers'

export function SuperviseeForm() {
  const form = useForm<SuperviseeFormValues>({
    resolver: zodResolver(superviseeSchema),
    defaultValues: superviseeDefaultValues,
  })

  function onSubmit(values: SuperviseeFormValues) {
    console.log('Supervisee signup:', values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="typeOfSupervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of supervisor you are looking for</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. LMFT, LCSW, LPC"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supervisorDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe a supervisor you are looking for</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px]"
                  placeholder="Share your goals, preferred supervision style, and what you hope to gain..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cityStateZipcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City, State, Zipcode</FormLabel>
              <FormControl>
                <Input placeholder="e.g. San Francisco, CA 94102" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="howSoon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How soon are you looking for a supervisor?</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select an option</option>
                  {howSoonOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Sign Up as Supervisee
        </Button>
      </form>
    </Form>
  )
}
