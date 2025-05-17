import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/lib/database/connect";
import User from "@/lib/database/models/user.model";

export async function getCurrentOrganizer() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectToDatabase();

<<<<<<< HEAD
    // Check if the user already exists in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
=======
    let organizer = await User.findOne({ clerkId: userId });
>>>>>>> origin/enrico

    // If not found, create a new one using Clerk data
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

<<<<<<< HEAD
      user = await User.create({
=======
      organizer = await User.create({
>>>>>>> origin/enrico
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        photo: clerkUser.imageUrl || "",
<<<<<<< HEAD
        organization: "Not specified", // You can prompt user to update this later
=======
        organization: clerkUser.firstName
          ? `${clerkUser.firstName}'s Events`
          : "New Organizer",
>>>>>>> origin/enrico
      });
    }

    return user;
  } catch (error) {
<<<<<<< HEAD
    console.error("getCurrentOrganizer error:", error);
    throw new Error("Failed to retrieve current organizer.");
=======
    console.error("getCurrentOrganizer() error:", error);
    throw new Error("Failed to retrieve or create organizer.");
>>>>>>> origin/enrico
  }
}