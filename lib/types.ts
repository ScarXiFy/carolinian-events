import { Document, Types } from "mongoose"

// For Mongoose documents (backend)
export interface IEventDocument extends Document {
  _id: Types.ObjectId
  title: string
  description: string
  location: string
  imageUrl: string
  startDateTime: Date
  endDateTime: Date
  price: string
  isFree: boolean
  organizer: Types.ObjectId | {
    _id: Types.ObjectId
    firstName: string
    lastName: string
  }
  createdAt: Date
  // Add other fields as needed
}

// For frontend usage
export interface IEvent {
  _id: string
  title: string
  description: string
  location: string
  imageUrl: string
  startDateTime: Date | string
  endDateTime: Date | string
  category?: Types.ObjectId
  price: string
  isFree: boolean
  organizer: {
    _id: string
    firstName: string
    lastName: string
  }
  createdAt?: Date | string
}

export interface IUser {
  clerkId: string
  firstName: string
  lastName: string
  email: string
  photo: string
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
}

export type GetAllEventsParams = {
  query?: string
  category?: string
  limit?: number
  page?: number
}

export type EventCardProps = {
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
    firstName: string
    lastName: string
  }
}