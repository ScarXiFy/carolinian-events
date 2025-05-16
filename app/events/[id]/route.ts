import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("carolinian-events");

  const event = await db.collection("events").findOne({ _id: new ObjectId(params.id) });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("carolinian-events");

  const result = await db.collection("events").deleteOne({ _id: new ObjectId(params.id) });

  return NextResponse.json({ deleted: result.deletedCount === 1 });
}
