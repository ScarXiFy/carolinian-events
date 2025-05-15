"use client"
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
//import { Textarea } from "@/components/ui/textarea"
import { createEvent } from "@/lib/actions/event.actions"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
  startDateTime: z.string().datetime({ message: "Invalid date format" }),
  endDateTime: z.string().datetime({ message: "Invalid date format" }),
  price: z.string(),
  isFree: z.boolean(),
})

export function CreateEventForm() {
  const { user } = useUser()
  const router = useRouter()
  const [error, setError] = React.useState("")

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      imageUrl: "",
      startDateTime: new Date().toISOString(), // Default to current datetime
      endDateTime: new Date(Date.now() + 3600000).toISOString(), // Default to 1 hour from now
      price: "0",
      isFree: false,
    },
  })

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      if (!user) throw new Error("Please sign in first")
      
      const eventData = {
        ...values,
        organizer: user.id,
        startDateTime: new Date(values.startDateTime),
        endDateTime: new Date(values.endDateTime),
        price: values.price || "0", // Ensure price is never empty
      }

      const newEvent = await createEvent(eventData)
      router.push(`/events/${newEvent._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Existing form fields... */}
        
        {/* Add datetime inputs */}
        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date & Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date & Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Event</Button>
      </form>
    </Form>
  )
}