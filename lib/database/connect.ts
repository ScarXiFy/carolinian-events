// connect.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing from .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend globalThis to include mongooseGlobal
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: MongooseCache | undefined;
}

// Use existing cached connection or create a new one
globalThis.mongooseGlobal = globalThis.mongooseGlobal || { conn: null, promise: null };
const cached = globalThis.mongooseGlobal;

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('🚀 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Creating new MongoDB connection');
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getMongoClient() {
  await connectToDatabase(); // Ensure Mongoose is connected
  return mongoose.connection.getClient(); // Returns native MongoDB driver client
}