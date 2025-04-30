/**
 * MongoDB database connection utilities
 * Implements connection pooling pattern for Next.js serverless environment
 * 
 * @module dbConnect
 */

import mongoose, { Mongoose, ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Interface for mongoose connection cache
 * 
 * @interface MongooseCache
 * @property {Mongoose | null} conn - The cached Mongoose connection instance
 * @property {Promise<Mongoose> | null} promise - Promise for pending connection
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Global type declaration to extend the global namespace
 * Allows for persistent connection across serverless function invocations
 */
declare global {
  var mongoose: MongooseCache;
}

// Initialize the cached variable
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

/**
 * Connects to the MongoDB database using Mongoose.
 * Implements connection pooling to prevent multiple connections in serverless environments.
 * Caches the connection to reuse in subsequent calls, improving performance.
 * 
 * @async
 * @function dbConnect
 * @returns {Promise<Mongoose>} The Mongoose instance with an active connection
 * @throws Will throw an error if the MongoDB connection fails
 * @example
 * // Connect to the database
 * const mongoose = await dbConnect();
 * // Use the connection to perform database operations
 * const User = mongoose.model('User', userSchema);
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