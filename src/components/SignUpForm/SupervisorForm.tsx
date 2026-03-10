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
import { UploadFile } from '@/components/ui/upload-file'
import { supervisorSchema, type SupervisorFormValues } from './schema'
import { supervisorDefaultValues } from './helpers'

export function SupervisorForm() {
  const form = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: supervisorDefaultValues,
  })

  function onSubmit(values: SupervisorFormValues) {
    console.log('Supervisor signup:', values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License</FormLabel>
              <FormControl>
                <Input placeholder="Enter your license number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Experience</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="npiNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NPI Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your NPI number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration</FormLabel>
              <FormControl>
                <Input type="date" placeholder="MM/DD/YYYY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certification</FormLabel>
              <FormControl>
                <Input placeholder="Enter your certification" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="patientPopulation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Population</FormLabel>
              <FormControl>
                <Input placeholder="Describe your patient population" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licensePicture"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <FormItem>
              <FormLabel>Picture of the License</FormLabel>
              <FormControl>
                <UploadFile
                  id="license-picture-upload"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  inputRef={ref}
                  accept="image/*"
                  uploadTitle="Upload your license image"
                  uploadHint="PNG or JPG up to 10MB"
                  removeFileAriaLabel="Remove uploaded license image"
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

        <Button type="submit" className="w-full">
          Sign Up as Supervisor
        </Button>
      </form>
    </Form>
  )
}
