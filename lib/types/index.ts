// lib/types/index.ts
import { Document, Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId | string;
  name: string;
  description?: string;
}

export type FrontEndCategory = {
    _id: string;
    name: string;
    description?: string;
}

export interface PopulatedCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  createdAt: Date;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  imageUrl: string;
  categories: string[];
  organizer: Types.ObjectId;
  additionalOrganizers: Array<{
    name: string;
    socialMedia?: string;
  }>;
  sponsors: Array<{
    name: string;
    website?: string;
  }>;
  contactEmail: string;
  contactPhone?: string;
  requirements?: string;
  participants?: Types.ObjectId;
  tags?: string[];
  registrations: Types.ObjectId[];
  maxRegistrations: number | null;
  registrationCount: number;
  availableSpots: number | "Unlimited";
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
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
  additionalOrganizers: Array<{ name: string; socialMedia?: string }>
  sponsors?: Array<{ name: string; website?: string }>
  contactEmail: string
  contactPhone?: string
  requirements?: string
  maxRegistrations?: number | null
  tags: string[]
  categories: string[]
}