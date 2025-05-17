'use server';

import { connectToDatabase } from '@/lib/database/connect';
import User from '@/lib/database/models/user.model';

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
      { upsert: true, new: true }
    );

    return JSON.parse(JSON.stringify(updatedUser));
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