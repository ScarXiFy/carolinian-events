// lib/actions/user.actions.ts

'use server';

import { connectToDatabase } from '@/lib/database/connect';
import User from '@/lib/database/models/user.model';

// lib/actions/user.actions.ts
export async function createOrUpdateUser(user: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  organization?: string;
}) {
  try {
    await connectToDatabase();
    
    // First check if user exists
    const existingUser = await User.findOne({ clerkId: user.clerkId });
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: user.clerkId },
        {
          $set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.photo,
            organization: user.organization || 'Personal',
          }
        },
        { new: true }
      );
      return JSON.parse(JSON.stringify(updatedUser));
    } else {
      // Create new user if doesn't exist
      const newUser = await User.create({
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        photo: user.photo || '',
        organization: user.organization || 'Personal',
        role: 'user'
      });
      return JSON.parse(JSON.stringify(newUser));
    }
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findOneAndDelete({ clerkId });
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}