import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '@/lib/database/models/user.model';
import { connectToDatabase } from '@/lib/database/connect';

export async function ensureUser(clerkId: string) {
  await connectToDatabase();
  
  const existingUser = await User.findOne({ clerkId });
  if (existingUser) return existingUser;
  
  const clerkUser = await clerkClient.users.getUser(clerkId);
  
  return await User.create({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    photo: clerkUser.imageUrl,
    organization: `${clerkUser.firstName || 'User'}'s Events`
  });
}