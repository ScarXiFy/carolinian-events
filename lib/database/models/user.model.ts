// lib/database/models/user.model.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
  organization: { type: String },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
}, { timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;