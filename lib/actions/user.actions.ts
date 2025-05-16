'use server'

import { connectToDatabase } from '@/lib/database/connect'
import User from '@/lib/database/models/user.model'
import { IUser } from '@/lib/types'

export async function createOrUpdateUser(user: IUser) {
  try {
    await connectToDatabase()

    const existingUser = await User.findOne({ clerkId: user.clerkId })

    if (existingUser) {
      // Update existing user
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: user.clerkId },
        user,
        { new: true }
      )
      return JSON.parse(JSON.stringify(updatedUser))
    } else {
      // Create new user
      const newUser = await User.create(user)
      return JSON.parse(JSON.stringify(newUser))
    }
  } catch (error) {
    console.error('Error creating/updating user:', error)
    throw error
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase()
    const deletedUser = await User.findOneAndDelete({ clerkId })
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}