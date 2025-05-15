"use client"
import React from "react"
import { useForm } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
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
  organizers: z.array(z.string()).min(1, "At least one organizer is required"),
  sponsors: z.array(z.string()).optional(),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().optional(),
  maxAttendees: z.number().min(1, "Must have at least 1 attendee").optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.string().optional(),
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
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + 3600000).toISOString(),
      price: "0",
      isFree: false,
      organizers: [""],
      sponsors: [""],
      contactEmail: "",
      contactPhone: "",
      maxAttendees: undefined,
      tags: [""],
      requirements: "",
    },
  })

  const { fields: organizerFields, append: appendOrganizer, remove: removeOrganizer } = useFieldArray({
    control: form.control,
    name: "organizers",
  })

  const { fields: sponsorFields, append: appendSponsor, remove: removeSponsor } = useFieldArray({
    control: form.control,
    name: "sponsors",
  })

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "tags",
  })

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      if (!user) throw new Error("Please sign in first")
      
      const eventData = {
        ...values,
        organizer: user.id,
        startDateTime: new Date(values.startDateTime),
        endDateTime: new Date(values.endDateTime),
        price: values.price || "0",
        organizers: values.organizers.filter(org => org.trim() !== ""),
        sponsors: values.sponsors?.filter(sponsor => sponsor.trim() !== ""),
        tags: values.tags?.filter(tag => tag.trim() !== ""),
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Details</h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Tech Conference 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Image URL*</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Time</h3>
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                    <FormLabel>End Date & Time*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"></input>
                      </FormControl>
                      <FormLabel className="!mt-0">Free Event</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Organizers Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organizers</h3>
            {organizerFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`organizers.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index > 0 ? "sr-only" : ""}>
                      {index === 0 ? "Organizer*" : "Additional Organizer"}
                    </FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Organizer name or email"
                          {...field}
                        />
                      </FormControl>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeOrganizer(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendOrganizer("")}
            >
              Add Organizer
            </Button>
          </div>

          {/* Sponsors Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sponsors</h3>
            {sponsorFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`sponsors.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index > 0 ? "sr-only" : ""}>
                      {index === 0 ? "Sponsor" : "Additional Sponsor"}
                    </FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Sponsor name"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSponsor(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendSponsor("")}
            >
              Add Sponsor
            </Button>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Capacity</h3>
              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>
            {tagFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`tags.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index > 0 ? "sr-only" : ""}>
                      {index === 0 ? "Tags" : "Additional Tag"}
                    </FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. Technology, Conference"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeTag(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendTag("")}
            >
              Add Tag
            </Button>
          </div>

          {/* Requirements */}
          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requirements for attendees..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full md:w-auto">
            Create Event
          </Button>
        </form>
      </Form>
  );
}