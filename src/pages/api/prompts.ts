import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../lib/dbConnect';

// Define schema for users (match your document structure in MongoDB)
const userSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  first_name: String,
  last_name: String,
  gender: String,
  accountCreated: Boolean,
}, { collection: 'users' });  // Specify collection name in Compass

// Create/reuse the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const users = await User.find({});
    return res.status(200).json(users);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
