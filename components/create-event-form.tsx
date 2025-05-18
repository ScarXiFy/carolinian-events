// components/create-event-form.tsx
"use client"
import React, { useEffect, useState } from "react"
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
import ImageUpload from "@/components/image-upload"
import { Calendar, Clock, MapPin, Tag, User, Users, Mail, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface EventFormProps {
  event?: {
    _id: string;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: string;
    endDateTime: string;
    price: string;
    isFree: boolean;
    organizers: Array<{ name: string; socialMedia: string }>;
    sponsors?: Array<{ name: string; website: string }>;
    contactEmail: string;
    contactPhone?: string;
    maxAttendees?: number;
    tags: string[];
    requirements?: string;
  };
  onSubmit?: (values: z.infer<typeof eventFormSchema>) => Promise<void>;
}

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
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  requirements: z.string().optional(),
})

const LOCATION_OPTIONS = [
  "USC Talamban Campus",
  "USC Downtown Campus",
]

const PREDEFINED_TAGS = ["Scientia", "Virtus", "Devotio"]

export function CreateEventForm({ event, onSubmit: propOnSubmit }: EventFormProps) {
  const { user } = useUser()
  const router = useRouter()
  const [error, setError] = React.useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      imageUrl: event?.imageUrl || "",
      startDateTime: event?.startDateTime || new Date().toISOString(),
      endDateTime: event?.endDateTime || new Date(Date.now() + 3600000).toISOString(),
      price: event?.price || "0",
      isFree: event?.isFree || false,
      organizers: event?.organizers || [{ name: user?.fullName || "", socialMedia: "" }],
      sponsors: event?.sponsors || [],
      contactEmail: event?.contactEmail || user?.primaryEmailAddress?.emailAddress || "",
      contactPhone: event?.contactPhone || "",
      maxAttendees: event?.maxAttendees || undefined,
      tags: event?.tags || [],
      requirements: event?.requirements || "",
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

  const tags = form.watch("tags") || []

  useEffect(() => {
    if (form.watch("isFree")) {
      form.setValue("price", "0");
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      setIsSubmitting(true)
      
      if (propOnSubmit) {
        await propOnSubmit(values)
      } else {
        if (!user) throw new Error("Please sign in first");
        
        const eventData = {
          ...values,
          startDateTime: new Date(values.startDateTime).toISOString(),
          endDateTime: new Date(values.endDateTime).toISOString(),
          organizer: user.id,
        };

        await createEvent(eventData);
      }
      
      router.push("/my-events");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      form.setValue("tags", [...tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", tags.filter(tag => tag !== tagToRemove));
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{event ? "Edit Event" : "Create New Event"}</h1>
        <p className="text-muted-foreground">
          {event ? "Update your event details" : "Fill out the form below to create your event"}
        </p>
      </div>

      <Form {...form}>
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Event Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        placeholder="Describe your event in detail..." 
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
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {location}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Add custom location...
                              </div>
                            </SelectItem>
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
                    <FormLabel>Event Image*</FormLabel>
                    <div className="space-y-2">
                      <ImageUpload 
                        onChange={(url) => field.onChange(url)}
                        value={field.value}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Date & Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time*</FormLabel>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
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
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">₱</span>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={form.watch("isFree")}
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? "0" : value.toString());
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Free Event</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span>{field.value ? "Free" : "Paid"}</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organizers Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Organizers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {organizerFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 rounded-lg border">
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
                      size="sm"
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
                size="sm"
                onClick={() => appendOrganizer({ name: "", socialMedia: "" })}
              >
                Add Organizer
              </Button>
            </CardContent>
          </Card>

          {/* Sponsors Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Sponsors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sponsorFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 rounded-lg border">
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
                    size="sm"
                    onClick={() => removeSponsor(index)}
                  >
                    Remove Sponsor
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSponsor({ name: "", website: "" })}
              >
                Add Sponsor
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h4>
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
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Event Capacity
                </h4>
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
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <span>Tags*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Predefined Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    >
                      {tag}
                      {tags.includes(tag) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ }) => (
                  <FormItem>
                    <FormLabel>Custom Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type a tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value && !tags.includes(value)) {
                              form.setValue("tags", [...tags, value]);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="flex items-center gap-1 hover:bg-primary/90 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          aria-label={`Remove ${tag} tag`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                          className="hover:text-white focus:outline-none"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any special requirements for attendees?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dress code, items to bring, age restrictions, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (event ? "Updating..." : "Creating...") : (event ? "Update Event" : "Create Event")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}