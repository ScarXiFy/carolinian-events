import clientPromise from "./mongodb";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function getCurrentOrganizer() {
  const { userId } = await auth();

  if (!userId) return null;

  const client = await clientPromise;
  const db = client.db("carolinian-events");

  // Check if organizer exists in MongoDB
  const organizer = await db.collection("organizers").findOne({ clerkId: userId });

  // If not, auto-register them
  if (!organizer) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const newOrganizer = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: clerkUser.firstName + " " + clerkUser.lastName,
    };

    const result = await db.collection("organizers").insertOne(newOrganizer);
    const insertedOrganizer = await db.collection("organizers").findOne({ _id: result.insertedId });
    return insertedOrganizer || newOrganizer;
  }

  return organizer;
}
