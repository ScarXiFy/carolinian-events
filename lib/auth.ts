import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/lib/database/connect";
import User from "@/lib/database/models/user.model";

export async function getCurrentOrganizer() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectToDatabase();

    let organizer = await User.findOne({ clerkId: userId });

    if (!organizer) {
      const clerkUser = await clerkClient.users.getUser(userId);

      organizer = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        photo: clerkUser.imageUrl || "",
        organization: clerkUser.firstName
          ? `${clerkUser.firstName}'s Events`
          : "New Organizer",
      });
    }

    return organizer;
  } catch (error) {
    console.error("getCurrentOrganizer() error:", error);
    throw new Error("Failed to retrieve or create organizer.");
  }
}