import { IEvent } from "@/lib/types";
import { Schema, model, models } from "mongoose"

const EventSchema = new Schema<IEvent>({
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
      validator: function(this: IEvent, value: Date) {
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
category: { 
    type: Schema.Types.ObjectId, 
    ref: "Category",
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
  participants: { 
    type: Schema.Types.ObjectId, 
    ref: "Participants" 
  },

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
}
)

// Add virtual for registration count
EventSchema.virtual("registrationCount").get(function() {
  return this.registrations?.length || 0;
});

// Add virtual for available spots (if using maxRegistrations)
EventSchema.virtual("availableSpots").get(function() {
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

const Event = models.Event || model<IEvent>("Event", EventSchema)

export default Event