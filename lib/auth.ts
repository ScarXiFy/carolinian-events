import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/lib/database/connect";
import User from "@/lib/database/models/user.model";

export async function getCurrentOrganizer() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectToDatabase();

    // Check if the user already exists in MongoDB
    let user = await User.findOne({ clerkId: userId });

    // If not found, create a new one using Clerk data
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        photo: clerkUser.imageUrl || "",
        organization: "Not specified", // You can prompt user to update this later
      });
    }

    return user;
  } catch (error) {
    console.error("getCurrentOrganizer error:", error);
    throw new Error("Failed to retrieve current organizer.");
  }
}
