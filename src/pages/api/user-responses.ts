import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import UserResponse from '../../models/UserResponse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // GET - Fetch user responses (either all for a user or for a specific prompt)
  if (req.method === 'GET') {
    try {
      const { userId, promptId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      // If promptId is provided, get the specific response
      if (promptId) {
        const response = await UserResponse.findOne({ userId, promptId });
        return res.status(200).json({ success: true, data: response });
      }

      // Otherwise, get all responses for this user
      const responses = await UserResponse.find({ userId });
      return res.status(200).json({ success: true, data: responses });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // POST - Save a new user response
  else if (req.method === 'POST') {
    try {
      const { userId, promptId, selectedResponse } = req.body;

      if (!userId || !promptId || !selectedResponse) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID, prompt ID, and selected response are required' 
        });
      }

      // Check if user has already responded to this prompt
      const existingResponse = await UserResponse.findOne({ userId, promptId });
      
      if (existingResponse) {
        return res.status(400).json({ 
          success: false, 
          message: 'User has already responded to this prompt',
          data: existingResponse
        });
      }

      // Create and save the new response
      const newResponse = await UserResponse.create({
        userId,
        promptId,
        selectedResponse
      });

      res.status(201).json({ success: true, data: newResponse });
    } catch (error: any) {
      // If this is a duplicate key error (user already responded), return existing response
      if (error.code === 11000) {
        const existingResponse = await UserResponse.findOne({ 
          userId: req.body.userId, 
          promptId: req.body.promptId 
        });
        
        return res.status(400).json({ 
          success: false, 
          message: 'User has already responded to this prompt',
          data: existingResponse
        });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Method not allowed
  else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 