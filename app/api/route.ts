<<<<<<< HEAD
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("carolinian-events");
  const data = await req.json();

  const result = await db.collection("events").insertOne({
    ...data,
    organizerId: userId,
    joinedUserIds: [],
  });

  return NextResponse.json(result);
}
=======
import { connectToDatabase } from '@/lib/database/connect';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  return NextResponse.json({ message: 'Connected to MongoDB!' });
}
>>>>>>> origin/main
