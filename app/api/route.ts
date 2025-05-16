import { connectToDatabase } from '@/lib/database/connect';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  return NextResponse.json({ message: 'Connected to MongoDB!' });
}