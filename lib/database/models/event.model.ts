import { IEventDocument } from "@/lib/types";
import { Schema, model, models } from "mongoose"

const EventSchema = new Schema({
  title: { 
    type: String, 
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: { 
    type: String, 
    required: [true, "Description is required"],
    trim: true,
    minlength: [20, "Description should be at least 20 characters"]
  },
  location: { 
    type: String, 
    required: [true, "Location is required"],
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  startDateTime: { 
    type: Date, 
    required: [true, "Start date is required"],
    validate: {
      validator: function(this: IEventDocument, value: Date) {
        return value < this.endDateTime
      },
      message: "Start date must be before end date"
    }
  },
  endDateTime: { 
    type: Date, 
    required: [true, "End date is required"]
  },
  price: { 
    type: String,
    default: "0"
  },
  isFree: { 
    type: Boolean, 
    default: false 
  },
  imageUrl: {
    type: String,
    required: [true, "Image URL is required"],
    validate: {
      validator: function (value: string) {
        return typeof value === "string" && value.trim().length > 0;
      },
      message: "Image URL must be a non-empty string",
    },
  },
  categories: {
    type: [String],
    required: [true, "At least one category is required"],
    default: [],
    index: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  organizer: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  additionalOrganizers: [{
    name: { type: String, required: true },
    socialMedia: { type: String }
  }],
  sponsors: [{
    name: { type: String, required: true },
    website: { type: String }
  }],
  contactEmail: {
    type: String,
    required: [true, "Contact email is required"],
    validate: {
      validator: function(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Please enter a valid email address"
    }
  },
  contactPhone: {
    type: String,
    validate: {
      validator: function(value: string) {
        return !value || /^\+?[\d\s-()]+$/.test(value);
      },
      message: "Please enter a valid phone number"
    }
  },
  requirements: {
    type: String,
    trim: true
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Participant",
    default: []
  }],
  registrations: [{
    type: Schema.Types.ObjectId,
    ref: "Registration",
    default: []
  }],
  maxRegistrations: {
    type: Number,
    default: null,
    validate: {
      validator: function (value: number | null) {
        return value === null || (Number.isInteger(value) && value > 0);
      },
      message: "Max registrations must be a positive integer or null",
    }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Add virtual for registration count
EventSchema.virtual("registrationCount").get(function(this: IEventDocument) {
  return this.registrations?.length || 0;
});

// Add virtual for available spots (if using maxRegistrations)
EventSchema.virtual("availableSpots").get(function(this: IEventDocument) {
  if (this.maxRegistrations === null || typeof this.maxRegistrations === "undefined") return "Unlimited";
  const registrationsLength = Array.isArray(this.registrations) ? this.registrations.length : 0;
  return Math.max(0, this.maxRegistrations - registrationsLength);
});

// Add index for registrations
EventSchema.index({ registrations: 1 });

// Indexes for better query performance
EventSchema.index({ title: "text", description: "text", location: "text" })
EventSchema.index({ startDateTime: 1 })
EventSchema.index({ organizer: 1 })

const Event = models.Event || model<IEventDocument>("Event", EventSchema)

export default Event