// lib/auth.ts

import { auth } from "@clerk/nextjs/server";
//import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/lib/database/connect";
import User from "@/lib/database/models/user.model";

// lib/auth.ts
export async function getCurrentOrganizer() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectToDatabase();

    const organizer = await User.findOne({ clerkId: userId });
    if (!organizer) {
      console.error('Organizer not found in database');
      return null;
    }

    return organizer;
  } catch (error) {
    console.error("getCurrentOrganizer() error:", error);
    throw new Error("Failed to retrieve organizer.");
  }
}