import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user.actions';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error('CLERK_WEBHOOK_SECRET missing');

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json('Missing headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;
  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      if (!id || !email_addresses?.[0]?.email_address) {
        return NextResponse.json('Missing user data', { status: 400 });
      }

      await createOrUpdateUser({
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        photo: image_url || undefined,
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (id) await deleteUser(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json('Internal error', { status: 500 });
  }

  return new NextResponse("Webhook received", { status: 200 })
}
