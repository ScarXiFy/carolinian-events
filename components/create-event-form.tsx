"use client"
import React, { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createEvent } from "@/lib/actions/event.actions"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/image-upload" // Import your ImageUpload component
import Image from "next/image"

function formatForDateTimeInput(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const organizerSchema = z.object({
  name: z.string().min(1, "Organizer name is required"),
  socialMedia: z.string().optional(),
})

const sponsorSchema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().min(1, "Please upload an event image"),
  startDateTime: z.string().refine((val) => {
    return !isNaN(new Date(val).getTime())
  }, {
    message: "Invalid start date format",
  }),
  endDateTime: z.string().refine((val) => {
    return !isNaN(new Date(val).getTime())
  }, {
    message: "Invalid end date format",
  }),
  price: z.string(),
  isFree: z.boolean(),
  organizers: z.array(organizerSchema).min(1, "At least one organizer is required"),
  sponsors: z.array(sponsorSchema).optional(),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().optional(),
  maxAttendees: z.number().min(1, "Must have at least 1 attendee").optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.string().optional(),
})

    // Add this array of locations (you can expand this later)
    const LOCATION_OPTIONS = [
        "USC Talamban Campus",
        "USC Downtown Campus",
    // Add more locations here as needed
    ]

    // Add this constant near the top of your file
    const PREDEFINED_TAGS = ["Scientia", 
        "Virtus", 
        "Devotio",
    // Add more predefined tags here
    ]

export function CreateEventForm() {
  const { user } = useUser()
  const router = useRouter()
  const [error, setError] = React.useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [showCustomLocation, setShowCustomLocation] = useState(false)

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
      organizers: [{ name: user?.fullName || "", socialMedia: "" }],
      sponsors: [],
      contactEmail: "",
      contactPhone: "",
      maxAttendees: undefined,
      tags: [],
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
    name: "tags" as never,
  })

  // In your form's onSubmit handler
async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      if (!user) throw new Error("Please sign in first");
      
      const eventData = {
        ...values,
        startDateTime: new Date(values.startDateTime).toISOString(),
        endDateTime: new Date(values.endDateTime).toISOString(),
        organizer: user.id,
      };

      await createEvent(eventData);
      router.push("/my-events");
      router.refresh();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
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
            {!showCustomLocation ? (
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomLocation(true)
                      form.setValue("location", "")
                    } else {
                      field.onChange(value)
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Add custom location...</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom location"
                  value={customLocation}
                  onChange={(e) => {
                    setCustomLocation(e.target.value)
                    field.onChange(e.target.value)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomLocation(false)
                    setCustomLocation("")
                    field.onChange("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </FormItem>
        )}
      />

            <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload Event Image*</FormLabel>
            <div className="space-y-2">
              <ImageUpload 
                onChange={(url) => {
                  field.onChange(url) // Update form value with the uploaded URL
                }}
                value={field.value}
              />
              {field.value && (
                <div className="mt-2">
                  <div className="relative aspect-video w-full max-w-xs">
                    <Image
                      src={field.value}
                      alt="Uploaded event image"
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Image uploaded successfully
                  </p>
                </div>
              )}
            </div>
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
        <Input
          type="datetime-local"
          value={field.value ? formatForDateTimeInput(field.value) : ""}
          onChange={(e) => {
            const date = new Date(e.target.value)
            if (!isNaN(date.getTime())) {
              field.onChange(date.toISOString())
            }
          }}
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
      <FormLabel>End Date & Time*</FormLabel>
      <FormControl>
        <Input
          type="datetime-local"
          value={field.value ? formatForDateTimeInput(field.value) : ""}
          onChange={(e) => {
            const date = new Date(e.target.value)
            if (!isNaN(date.getTime())) {
              field.onChange(date.toISOString())
            }
          }}
        />
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
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
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
            <div key={field.id} className="space-y-4 border p-4 rounded-lg">
              <FormField
                control={form.control}
                name={`organizers.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index > 0 ? "sr-only" : ""}>
                      {index === 0 ? "Organizer Name*" : "Additional Organizer"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Organizer name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`organizers.${index}.socialMedia`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Links</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Github: https://github.com/username\nLinkedIn: https://linkedin.com/in/username\n...etc"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeOrganizer(index)}
                  className="mt-2"
                >
                  Remove Organizer
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendOrganizer({ name: "", socialMedia: "" })}
          >
            Add Organizer
          </Button>
        </div>

        {/* Sponsors Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sponsors</h3>
          {sponsorFields.map((field, index) => (
            <div key={field.id} className="space-y-4 border p-4 rounded-lg">
              <FormField
                control={form.control}
                name={`sponsors.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index > 0 ? "sr-only" : ""}>
                      {index === 0 ? "Sponsor Name*" : "Additional Sponsor"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sponsor name (e.g., Redbull)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`sponsors.${index}.website`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => removeSponsor(index)}
                className="mt-2"
              >
                Remove Sponsor
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSponsor({ name: "", website: "" })}
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
  
  {/* Predefined tags */}
  <div className="flex flex-wrap gap-2">
    {PREDEFINED_TAGS.map((tag) => (
      <Button
        key={tag}
        type="button"
        variant={form.watch("tags")?.includes(tag) ? "default" : "outline"}
        onClick={() => {
          const currentTags = form.getValues("tags") || []
          if (currentTags.includes(tag)) {
            form.setValue(
              "tags",
              currentTags.filter((t) => t !== tag)
            )
          } else {
            form.setValue("tags", [...currentTags, tag])
          }
        }}
      >
        {tag}
      </Button>
    ))}
  </div>

  {/* Custom tags input */}
  {tagFields.map((field, index) => (
    <FormField
      key={field.id}
      control={form.control}
      name={`tags.${index}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={index > 0 ? "sr-only" : ""}>
            {index === 0 ? "Custom Tags" : "Additional Tag"}
          </FormLabel>
          <div className="flex space-x-2">
            <FormControl>
              <Input
                placeholder="Add custom tag (press Enter)"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (field.value.trim()) {
                      appendTag({ name: "" })
                    }
                  }
                }}
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
    onClick={() => appendTag({ name: "" })}
  >
    Add Custom Tag
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
  )
}