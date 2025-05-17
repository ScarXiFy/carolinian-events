// lib/types.ts
import { Document, ObjectId, Schema, Types } from "mongoose"
import { FilterQuery } from "mongoose"

// Registration Types
export interface IRegistration {
  _id: Types.ObjectId;
  event: Types.ObjectId | IEvent;
  user: Types.ObjectId | IUser;
  registeredAt: Date;
  status: "pending" | "confirmed" | "cancelled" | "waitlisted";
  paymentStatus?: "unpaid" | "pending" | "paid" | "refunded";
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// For Mongoose documents (backend)
export interface IEventDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  organizer: Types.ObjectId | {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  registrations?: Types.ObjectId[] | IRegistration[];
  maxRegistrations?: number | null;
  registrationCount?: number;
  availableSpots?: number | "Unlimited";
  // Add other fields as needed
}

// For frontend usage
export interface IEvent {
  _id: string | ObjectId;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  category?: Types.ObjectId;
  price: string;
  isFree: boolean;
  tags: string[];
  organizer: {
    _id: string;
    organization: string;
  };
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    department: string;
  };
  registrations?: IRegistration[];
  maxRegistrations?: number | null;
  registrationCount?: number;
  availableSpots?: number | "Unlimited";
  createdAt?: Date | string;
}

export interface IUser {
  clerkId: string;
  organization: string;
  email: string;
  photo: string;
  registrations?: Types.ObjectId[] | IRegistration[];
  // Add any additional fields you need
}


export type CreateEventParams = {
  title: string
  description: string
  location: string
  imageUrl: string
  startDateTime: Date | string
  endDateTime: Date | string
  price?: string
  isFree?: boolean
  organizer: string
  maxRegistrations?: number | null
}

// Add new type for registration
export type RegisterForEventParams = {
  eventId: string;
  userId: string;
  status?: "pending" | "confirmed";
  paymentStatus?: "unpaid" | "pending";
}

// Add new type for registration status update
export type UpdateRegistrationParams = {
  registrationId: string;
  status: "pending" | "confirmed" | "cancelled" | "waitlisted";
  paymentStatus?: "unpaid" | "pending" | "paid" | "refunded";
}

export type GetAllEventsParams = {
  query?: string
  category?: string
  limit?: number
  page?: number
}

export type EventCardProps = IEvent & {
  _id: string
  title: string
  description: string
  location: string
  imageUrl: string
  startDateTime: Date
  endDateTime: Date
  price: string
  isFree: boolean
  organizer: {
    _id: string
    organization: string
  }
}

export interface EventConditions {
  $text?: { $search: string };
  category?: Schema.Types.ObjectId;
  tags?: string | { $in: string[] };
  startDateTime?: { $gte?: Date; $lt?: Date };
  endDateTime?: { $lt?: Date };
  isFree?: boolean;
  isPublished?: boolean;
  organizer?: Schema.Types.ObjectId;
  $or?: Array<{
    title?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    location?: { $regex: string; $options: string };
  }>;
}

export type EventFilterQuery = FilterQuery<IEvent> & {
  $Text?: { $search: string };
}