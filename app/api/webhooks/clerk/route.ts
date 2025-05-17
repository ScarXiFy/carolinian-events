// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connect';
import User from '@/lib/database/models/user.model';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is missing');
  }

  // Await the headers promise
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  const eventType = evt.type;

  try {
    await connectToDatabase();

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      await User.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
        organization: first_name ? `${first_name}'s Organization` : 'New Organizer',
        role: 'organizer'
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      await User.findOneAndDelete({ clerkId: id });
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error occurred', { status: 500 });
  }
}