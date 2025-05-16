import clientPromise from "./mongodb";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function getCurrentOrganizer() {
  try {
    const { userId } = await auth();

    if (!userId) return null;

    const client = await clientPromise;
    const db = client.db("carolinian-events");

    let organizer = await db.collection("organizers").findOne({ clerkId: userId });

    if (!organizer) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const newOrganizer = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      };

      const result = await db.collection("organizers").insertOne(newOrganizer);
      organizer = await db.collection("organizers").findOne({ _id: result.insertedId });
    }

    return organizer;
  } catch (error) {
    console.error("getCurrentOrganizer() error:", error);
    throw error;
  }
}
