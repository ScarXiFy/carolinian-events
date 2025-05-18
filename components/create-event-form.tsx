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
import { Category } from "@/lib/types/index"

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
    categoryId?: string;
    category?: {
      _id: string;
      name: string;
    }
  };
  categories?: Category[];
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

export const eventFormSchema = z.object({
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
  categoryId: z.string().optional(),
})

const LOCATION_OPTIONS = [
  "USC Talamban Campus",
  "USC Downtown Campus",
]

const PREDEFINED_TAGS = ["Scientia", "Virtus", "Devotio"]

export function CreateEventForm({ event, categories, onSubmit: propOnSubmit }: EventFormProps) {
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
      categoryId: event?.categoryId || "",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center space-y-6">
          <div className="inline-block p-2.5 px-5 rounded-full bg-primary/10 mb-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary tracking-wide">Event Management</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-top-2">
            {event ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2 delay-100">
            {event ? "Update your event details" : "Fill out the form below to create your event"}
          </p>
        </div>
        <Button
            variant="outline"
            onClick={() => router.push("/events")}
            className="mb-12 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
          >
            Browse Events
          </Button>

        <Form {...form}>
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive animate-in fade-in slide-in-from-top-2">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Basic Information Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <User className="w-6 h-6" />
                    </div>
                    <span>Event Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Event Title*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Tech Conference 2023" 
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your event in detail..." 
                              className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Event Image*</FormLabel>
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
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span>Date & Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Start Date & Time*</FormLabel>
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
                                className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                          <FormLabel className="text-base font-medium">End Date & Time*</FormLabel>
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
                                className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Price*</FormLabel>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">₱</span>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                disabled={form.watch("isFree")}
                                className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                          <FormLabel className="text-base font-medium">Free Event</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary transition-colors duration-200"
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

              {/* Location Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Location*</FormLabel>
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
                                <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
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
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomLocation(false)
                                setCustomLocation("")
                                field.onChange("")
                              }}
                              className="hover:bg-primary/10 transition-colors duration-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Requirements Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">Special Requirements</CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Any special requirements for attendees?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dress code, items to bring, age restrictions, etc."
                            className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-10">
              {/* Organizers Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <Users className="w-6 h-6" />
                    </div>
                    <span>Organizers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  {organizerFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`organizers.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : "text-base font-medium"}>
                                {index === 0 ? "Organizer Name*" : "Additional Organizer"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Organizer name"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                              <FormLabel className="text-base font-medium">Social Media Links</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://github.com/username"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrganizer(index)}
                          className="mt-2 hover:bg-primary/10 transition-colors duration-200"
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
                    className="hover:bg-primary/10 transition-colors duration-200"
                  >
                    Add Organizer
                  </Button>
                </CardContent>
              </Card>

              {/* Sponsors Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <Users className="w-6 h-6" />
                    </div>
                    <span>Sponsors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  {sponsorFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`sponsors.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : "text-base font-medium"}>
                                {index === 0 ? "Sponsor Name*" : "Additional Sponsor"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Sponsor name (e.g., Redbull)"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                              <FormLabel className="text-base font-medium">Website URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSponsor(index)}
                        className="hover:bg-primary/10 transition-colors duration-200"
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
                    className="hover:bg-primary/10 transition-colors duration-200"
                  >
                    Add Sponsor
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <Mail className="w-6 h-6" />
                    </div>
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Contact Email*</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="contact@example.com" 
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                              {...field} 
                            />
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
                          <FormLabel className="text-base font-medium">Contact Phone</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+1 (555) 123-4567" 
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAttendees"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Maximum Attendees</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="100"
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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

              {/* Category and Tags Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <Tag className="w-6 h-6" />
                    </div>
                    <span>Category & Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Event Category*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories && categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium mb-2">Predefined Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {PREDEFINED_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            variant={tags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/90 transition-all duration-200 hover:scale-105"
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
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Custom Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type a tag and press Enter"
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="text-sm font-medium">Selected Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="default"
                              className="flex items-center gap-1 hover:bg-primary/90 transition-all duration-200 hover:scale-105"
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>

          <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-8 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? (event ? "Updating..." : "Creating...") : (event ? "Update Event" : "Create Event")}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}