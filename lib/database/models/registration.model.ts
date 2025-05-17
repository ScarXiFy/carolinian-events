import { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema({
  event: { 
    type: Schema.Types.ObjectId, 
    ref: "Event", 
    required: true,
    index: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "waitlisted"],
    default: "confirmed"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "refunded"],
    default: "unpaid"
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default models.Registration || model("Registration", RegistrationSchema);