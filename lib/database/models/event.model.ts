import { Schema, model, models } from "mongoose"
import { IEvent } from "@/lib/types"

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
      validator: (value: string) => {
        return /^(https?:\/\/).+\.(jpg|jpeg|png|webp)$/.test(value)
      },
      message: "Please provide a valid image URL"
    }
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: "Category" 
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
EventSchema.index({ title: "text", description: "text" })
EventSchema.index({ startDateTime: 1 })
EventSchema.index({ organizer: 1 })

const Event = models.Event || model<IEvent>("Event", EventSchema)

export default Event