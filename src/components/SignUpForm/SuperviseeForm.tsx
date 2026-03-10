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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { superviseeDefaultValues } from './helpers'
import { howSoonOptions, type SuperviseeFormValues, superviseeSchema } from './schema'

export function SuperviseeForm() {
  const form = useForm<SuperviseeFormValues>({
    resolver: zodResolver(superviseeSchema),
    defaultValues: superviseeDefaultValues,
  })

  function onSubmit(values: SuperviseeFormValues) {
    void values // TODO: implement API call
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
                <Input placeholder="e.g. LMFT, LCSW, LPC" {...field} />
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
              <Select
                value={field.value || undefined}
                onValueChange={(v) => field.onChange(v ?? '')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {howSoonOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
