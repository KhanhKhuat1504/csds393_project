import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      // Create a new user (accountCreated will be false by default)
      const newUser = await User.create(req.body);
      res.status(201).json({ success: true, data: newUser });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;
      
      // First try to find by clerkId (which is what we get from Clerk)
      let updatedUser = await User.findOneAndUpdate(
        { clerkId: id }, 
        updateData, 
        { new: true }
      );
      
      // If no user found with clerkId, try with MongoDB _id as fallback
      if (!updatedUser) {
        updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
      }
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      // Check if we're looking for a specific user
      const { id } = req.query;
      
      if (id) {
        // First try to find by clerkId
        let user = await User.findOne({ clerkId: id });
        
        // If not found, try by MongoDB _id
        if (!user) {
          user = await User.findById(id);
        }
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        return res.status(200).json({ success: true, data: user });
      }
      
      // Otherwise return all users
      const users = await User.find({});
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}