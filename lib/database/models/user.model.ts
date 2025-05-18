// lib\database\models\user.model.ts

import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: { 
    type: String, 
  },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
  organization: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'organizer', 'admin'], 
    default: 'user' 
  },
}, { timestamps: true });

// Add this to handle the existing duplicate key error
UserSchema.index({ username: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    username: { $exists: true, $ne: null } 
  } 
});

const User = models.User || model("User", UserSchema);

export default User;