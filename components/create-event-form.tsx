// components/create-event-form.tsx
"use client"
import React, { useEffect, useState } from "react"
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
import { Calendar, Clock, MapPin, Tag, User, X, Mail, Phone, Building2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
    tags?: string[];
    categoryId?: string;
    category?: {
      _id: string;
      name: string;
    }
    maxRegistrations?: number | null;
    contactEmail: string;
    contactPhone: string;
    requirements: string;
    sponsors?: Array<{ name: string; website?: string }>;
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
  tags: z.array(z.string()).min(1, "At least one category is required"),
  maxRegistrations: z.number().nullable().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().optional(),
  requirements: z.string().optional(),
  sponsors: z.array(z.object({
    name: z.string().min(1, "Sponsor name is required"),
    website: z.string().url("Please enter a valid URL").optional(),
  })).optional(),
})

const LOCATION_OPTIONS = [
  "USC Talamban Campus",
  "USC Downtown Campus",
]

const PREDEFINED_CATEGORIES = [
  { id: "scientia", name: "Scientia" },
  { id: "virtus", name: "Virtus" },
  { id: "devotio", name: "Devotio" }
]

export function CreateEventForm({ event, onSubmit: propOnSubmit }: EventFormProps) {
  const { user } = useUser()
  const router = useRouter()
  const [error, setError] = React.useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [sponsors, setSponsors] = useState<Array<{ name: string; website?: string }>>(
    event?.sponsors || []
  )

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
      tags: event?.tags || [],
      maxRegistrations: event?.maxRegistrations || null,
      contactEmail: event?.contactEmail || "",
      contactPhone: event?.contactPhone || "",
      requirements: event?.requirements || "",
      sponsors: event?.sponsors || [],
    },
  })

  const selectedCategories = form.watch("tags") || []

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      form.setValue("tags", [...selectedCategories, category])
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    form.setValue("tags", selectedCategories.filter(category => category !== categoryToRemove))
  }

  useEffect(() => {
    if (form.watch("price") === "0") {
      form.setValue("isFree", true);
    }
  }, [form]);

  const addSponsor = () => {
    const newSponsors = [...sponsors, { name: "", website: "" }]
    setSponsors(newSponsors)
    form.setValue("sponsors", newSponsors)
  }

  const removeSponsor = (index: number) => {
    const newSponsors = sponsors.filter((_, i) => i !== index)
    setSponsors(newSponsors)
    form.setValue("sponsors", newSponsors)
  }

  const updateSponsor = (index: number, field: "name" | "website", value: string) => {
    const newSponsors = [...sponsors]
    newSponsors[index] = { ...newSponsors[index], [field]: value }
    setSponsors(newSponsors)
    form.setValue("sponsors", newSponsors)
  }

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

        <Form {...form}>
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive animate-in fade-in slide-in-from-top-2">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
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
                                const newValue = isNaN(value) ? "0" : value.toString();
                                field.onChange(newValue);
                                if (newValue === "0") {
                                  form.setValue("isFree", true);
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
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">Free Event</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue("price", "0");
                                }
                              }}
                              className="data-[state=checked]:bg-primary transition-colors duration-200"
                            />
                            <span>{field.value ? "Free" : "Paid"}</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRegistrations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Maximum Registrations</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Leave empty for unlimited"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                            className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
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

            {/* Category Card */}
            <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                  <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                    <Tag className="w-6 h-6" />
                  </div>
                  <span>Event Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Predefined Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                          onClick={() => selectedCategories.includes(category.name) ? removeCategory(category.name) : addCategory(category.name)}
                        >
                          {category.name}
                          {selectedCategories.includes(category.name) && (
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
                        <FormLabel className="text-base font-medium">Custom Categories</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type a category and press Enter"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value && !selectedCategories.includes(value)) {
                                  addCategory(value);
                                  setCustomCategory("");
                                }
                              }
                            }}
                            className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategories.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                          <Badge
                            key={category}
                            variant="default"
                            className="flex items-center gap-1 hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                          >
                            {category}
                            <button
                              type="button"
                              aria-label={`Remove ${category} category`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCategory(category);
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

            {/* Sponsors Card */}
            <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-primary relative group-hover:translate-x-1 transition-transform duration-200">
                  <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span>Event Sponsors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="space-y-4">
                  {sponsors.map((sponsor, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`sponsors.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Sponsor Name*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter sponsor name"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    updateSponsor(index, "name", e.target.value)
                                  }}
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
                              <FormLabel className="text-base font-medium">Website (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com"
                                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    updateSponsor(index, "website", e.target.value)
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeSponsor(index)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 hover:bg-primary/10"
                    onClick={addSponsor}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sponsor
                  </Button>
                </div>
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
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="events@usc.edu.ph"
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Contact Phone (Optional)</FormLabel>
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+63 XXX XXX XXXX"
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-base font-medium">Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any requirements or prerequisites for attending the event..."
                            className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
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