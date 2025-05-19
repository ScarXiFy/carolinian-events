"use server"

import { clerkClient } from "@clerk/clerk-sdk-node"
import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import User from "@/lib/database/models/user.model"
import { CreateEventParams, IEvent } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { getCurrentOrganizer } from "@/lib/auth"
import Category from "../database/models/category.model"
import { FilterQuery } from "mongoose"

export async function createEvent(eventData: CreateEventParams) {
  try {
    await connectToDatabase();
    
    // 1. Find the User document
    let user = await User.findOne({ clerkId: eventData.organizer });
    
    if (!user) {
      // Fetch from Clerk API if not found
      const clerkUser = await clerkClient.users.getUser(eventData.organizer);
      
      // Create new user in your database
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || 'New',
        lastName: clerkUser.lastName || 'User',
        photo: clerkUser.imageUrl || '',
        organization: clerkUser.firstName ? `${clerkUser.firstName}'s Events` : 'New Organizer'
      });
    }

    // 2. Create event with the User's ObjectId
    const newEvent = await Event.create({
      ...eventData,
      organizer: user._id,
      startDateTime: new Date(eventData.startDateTime),
      endDateTime: new Date(eventData.endDateTime),
    });
    
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function getAllEvents({
  query = '',
  category = '',
  tag = '',
  filter = 'all'
}: {
  query?: string;
  category?: string;
  tag?: string;
  filter?: string;
} = {}): Promise<IEvent[]> {
  try {
    await connectToDatabase()
    
    const conditions: FilterQuery<IEvent> = {}

    // Text search
    if (query) {
      conditions.$text = { $search: query }
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ name: category })
      if (categoryDoc) {
        conditions.category = categoryDoc._id
      }
    }

    // Tag filter
    if (tag) {
      conditions.tags = tag
    }

    // Date filters
    const now = new Date()
    if (filter === 'upcoming') {
      conditions.startDateTime = { $gte: now }
    } else if (filter === 'past') {
      conditions.endDateTime = { $lt: now }
    } else if (filter === 'free') {
      conditions.isFree = true
    }

    const events = await Event.find(conditions)
      .populate({
        path: 'organizer',
        model: User,
        select: '_id firstName lastName'
      })
      .populate({
        path: 'category',
        model: Category,
        select: 'name'
      })
      .sort({ startDateTime: 'asc' })
      .lean()

    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await connectToDatabase()
    const organizer = await getCurrentOrganizer()

    if (!organizer) {
      throw new Error("Unauthorized: Organizer not found.")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error("Event not found.")
    }

    // Check ownership
    if (event.organizer.toString() !== organizer._id.toString()) {
      throw new Error("You can only delete events you created.")
    }

    await Event.findByIdAndDelete(eventId)
    revalidatePath("/events")

    return { success: true }
  } catch (err) {
    console.error("deleteEvent error:", err)
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete event." }
  }
}
interface UpdateEventParams {
  eventId: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl: string;
  category?: string;
  price: string;
  isFree: boolean;
  organizers: Array<{ name: string; socialMedia?: string }>;
  sponsors?: Array<{ name: string; website?: string }>;
  contactEmail: string;
  contactPhone?: string;
  maxAttendees?: number;
  tags: string[];
  requirements?: string;
}

export async function updateEvent(data: UpdateEventParams) {
  try {
    await connectToDatabase();
    const organizer = await getCurrentOrganizer();
    if (!organizer) throw new Error("Unauthorized");

    const event = await Event.findById(data.eventId);
    if (!event) throw new Error("Event not found");

    // Check ownership
    if (event.organizer.toString() !== organizer._id.toString()) {
      throw new Error("You can only edit your own events");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      data.eventId,
      {
        title: data.title,
        description: data.description,
        location: data.location,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        imageUrl: data.imageUrl,
        category: data.category, // ✅ fixed
        price: data.price,
        isFree: data.isFree,
        organizers: data.organizers,
        sponsors: data.sponsors || [],
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        maxAttendees: data.maxAttendees,
        tags: data.tags,
        requirements: data.requirements,
      },
      { new: true }
    );

    revalidatePath("/events");
    revalidatePath(`/events/${data.eventId}`);
    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    console.error("updateEvent error:", error);
    throw error;
  }
}


export async function getUserEvents(
  clerkUserId: string,
  {
    query = '',
    filter = 'all'
  }: {
    query?: string;
    filter?: string;
  } = {}
): Promise<IEvent[]> {
  try {
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: clerkUserId })
    if (!user) return []

    const conditions: FilterQuery<IEvent> = { organizer: user._id }

    // Text search
    if (query) {
      conditions.$text = { $search: query }
    }

    // Status filters
    const now = new Date()
    if (filter === 'upcoming') {
      conditions.startDateTime = { $gte: now }
    } else if (filter === 'past') {
      conditions.endDateTime = { $lt: now }
    } else if (filter === 'draft') {
      conditions.isPublished = false
    }

    const events = await Event.find(conditions)
      .populate({
        path: 'organizer',
        select: 'firstName lastName organization'
      })
      .populate({
        path: 'category',
        model: Category,
        select: 'name'
      })
      .sort({ startDateTime: 'asc' })
      .lean()

    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error("Error fetching user events:", error)
    throw error
  }
}

export async function getEventById(eventId: string, leanMode = true) {
  try {
    await connectToDatabase()

    const query = Event.findById(eventId).populate("category")

    const event = leanMode ? await query.lean() : await query

    if (!event || Array.isArray(event)) return null

    if (leanMode) {
      return {
        ...event,
        _id: (event._id as { toString(): string }).toString(),
        startDateTime: new Date(event.startDateTime).toISOString(),
        endDateTime: new Date(event.endDateTime).toISOString(),
        category: event.category ? {
          _id: event.category._id.toString(),
          name: event.category.name
        } : null,
        organizer: event.organizer?.toString?.() ?? "",
      }
    }

    return event // full Mongoose document
  } catch (error) {
    console.error("Error getting event:", error)
    return null
  }
}
