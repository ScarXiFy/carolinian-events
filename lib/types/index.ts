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
  category?: ICategory | Types.ObjectId; // Can be either populated or just ObjectId
  organizer: Types.ObjectId;
  participants?: Types.ObjectId;
  tags?: string[];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}