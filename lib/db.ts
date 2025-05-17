import mongoose from 'mongoose';

// More complete typing
interface MongooseConnection {
  isConnected?: mongoose.ConnectionStates; // Use Mongoose's built-in ConnectionStates
}

const connection: MongooseConnection = {};

async function dbConnect() {
  // Check if we're already connected
  if (connection.isConnected === mongoose.ConnectionStates.connected) {
    return;
  }

  // Check if we have a cached connection
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    connection.isConnected = mongoose.connection.readyState;
    return;
  }

  // Connect to MongoDB
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;
    
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export default dbConnect;