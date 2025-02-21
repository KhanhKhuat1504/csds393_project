import mongoose, { Mongoose, ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

// Initialize the cached variable
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

/**
 * Connects to the MongoDB database using Mongoose.
 * Caches the connection to reuse in subsequent calls.
 *
 * @returns {Promise<Mongoose>} The Mongoose instance.
 */
async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Cache the connection promise
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  // Await the connection promise and cache the connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise cache if the connection fails
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;