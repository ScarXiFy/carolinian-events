import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// CREATE (POST) and READ (GET)
export async function GET() {
  const client = await clientPromise;
  const db = client.db("carolinian-events"); // your DB name
  const events = await db.collection("events").find({}).toArray();

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const client = await clientPromise;
  const db = client.db("carolinian-events");
  const data = await request.json();

  const result = await db.collection("events").insertOne(data);

  return NextResponse.json(result);
}
