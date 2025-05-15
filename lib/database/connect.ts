import mongoose from "mongoose"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

const mongooseCache: MongooseCache = global.mongooseCache || { conn: null, promise: null }

async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongooseCache.conn) {
    return mongooseCache.conn
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(process.env.MONGODB_URI!).then((mongoose) => mongoose)
  }

  try {
    mongooseCache.conn = await mongooseCache.promise
  } catch (e) {
    mongooseCache.promise = null
    throw e
  }

  return mongooseCache.conn
}

export { connectToDatabase }