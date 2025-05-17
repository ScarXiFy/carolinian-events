"use client"
import React, { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createEvent } from "@/lib/actions/event.actions"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/image-upload"
import Image from "next/image"

const LOCATION_OPTIONS = ["USC Talamban Campus", "USC Downtown Campus"]
const PREDEFINED_TAGS = ["Scientia", "Virtus", "Devotio"]

const organizerSchema = z.object({
  name: z.string().min(1),
  socialMedia: z.string().optional(),
})

const sponsorSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
})

const eventFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(1),
  imageUrl: z.string().min(1),
  startDateTime: z.string(),
  endDateTime: z.string(),
  price: z.string(),
  isFree: z.boolean(),
  organizers: z.array(organizerSchema).min(1),
  sponsors: z.array(sponsorSchema).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  maxAttendees: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.string().optional(),
})

function formatForDateTimeInput(dateString: string) {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}

export function CreateEventForm() {
  const { user } = useUser()
  const router = useRouter()
  const [error, setError] = useState("")
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

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      if (!user) throw new Error("Please sign in first")
      const eventData = {
        ...values,
        startDateTime: new Date(values.startDateTime).toISOString(),
        endDateTime: new Date(values.endDateTime).toISOString(),
        organizer: user.id,
      }
      const newEvent = await createEvent(eventData)
      router.push(`/events/${newEvent._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#e9f5ee] flex flex-col items-center py-8 px-2 md:px-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Main event details */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="font-semibold text-lg mb-2 text-gray-800">Basic details</h2>
              <p className="text-gray-500 mb-6 text-sm">This section contains the basic details of your event.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title*</FormLabel>
                    <FormControl><Input {...field} placeholder="Tech Conference 2023" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Describe your event..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="location" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    {!showCustomLocation ? (
                      <>
                        <Select onValueChange={(val) => {
                          if (val === "custom") {
                            setShowCustomLocation(true)
                            form.setValue("location", "")
                          } else field.onChange(val)
                        }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {LOCATION_OPTIONS.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                            <SelectItem value="custom">Add custom location...</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Input value={customLocation} onChange={(e) => {
                          setCustomLocation(e.target.value)
                          field.onChange(e.target.value)
                        }} placeholder="Enter custom location" />
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCustomLocation(false)
                          setCustomLocation("")
                          field.onChange("")
                        }}>Cancel</Button>
                      </div>
                    )}
                  </FormItem>
                )} />

                <FormField name="startDateTime" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" value={formatForDateTimeInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value).toISOString())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="endDateTime" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" value={formatForDateTimeInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value).toISOString())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="price" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price*</FormLabel>
                    <FormControl><Input {...field} placeholder="0.00" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="isFree" control={form.control} render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                        aria-label="Free Event"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Free Event</FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="mt-6">
                <FormField name="imageUrl" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Event Image*</FormLabel>
                    <ImageUpload value={field.value} onChange={(url) => field.onChange(url)} />
                    {field.value && (
                      <div className="relative aspect-video w-full max-w-xs mt-2">
                        <Image src={field.value} alt="Uploaded image" fill className="rounded-md object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </div>
          {/* Right column: Organizer, sponsors, etc. */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="font-semibold text-lg mb-2 text-gray-800">Organizer details</h2>
              <p className="text-gray-500 mb-6 text-sm">Details about the event organizer.</p>
              {/* Organizers Section */}
              <div className="lg:col-span-10 col-span-12 space-y-12">
                <h3 className="text-2xl font-bold text-center mb-4 text-[#40916c] tracking-tight">Organizers</h3>
                {organizerFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 border p-4 rounded-lg w-full">
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
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="font-semibold text-lg mb-2 text-gray-800">Sponsor details</h2>
              <p className="text-gray-500 mb-6 text-sm">Details about the event sponsors.</p>
              {/* Sponsors Section */}
              <div className="lg:col-span-10 col-span-12 space-y-12">
                <h3 className="text-2xl font-bold text-center mb-4 text-[#40916c] tracking-tight">Sponsors</h3>
                {sponsorFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 border p-4 rounded-lg w-full">
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
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="lg:col-span-10 col-span-12 space-y-12">
                  <h3 className="text-2xl font-bold text-center mb-4 text-[#40916c] tracking-tight">Contact Information</h3>
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

                <div className="lg:col-span-10 col-span-12 space-y-12">
                  <h3 className="text-2xl font-bold text-center mb-4 text-[#40916c] tracking-tight">Event Capacity</h3>
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
              <div className="lg:col-span-10 col-span-12 space-y-12">
                <h3 className="text-2xl font-bold text-center mb-4 text-[#40916c] tracking-tight">Tags</h3>
                
                {/* Predefined tags */}
                <div className="lg:col-span-10 col-span-12 space-y-12">
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
              <div className="lg:col-span-10 col-span-12 space-y-12">
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

                <div className="flex justify-center w-full">
                  <Button type="submit" className="w-full sm:w-auto px-8 py-3 text-lg rounded-lg">
                    Create Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
      {/* Error message (if any) */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  )
}
