import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user.actions"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env")
  }

  const payload = await req.text()
  const headerPayload = await headers()
  const heads = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, heads) as WebhookEvent
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new NextResponse("Invalid webhook", { status: 400 })
  }

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await createOrUpdateUser({
      clerkId: id,
      email: email_addresses?.[0]?.email_address || "",
      firstName: first_name || "",
      lastName: last_name || "",
      photo: image_url || "",
      organization: "Not specified",
    })
  }

  if (eventType === "user.deleted") {
    const userId = evt.data.id
    if (typeof userId !== "string") {
      throw new Error("User ID is missing or invalid in webhook data")
    }
    await deleteUser(userId)
  }

  return new NextResponse("Webhook received", { status: 200 })
}
