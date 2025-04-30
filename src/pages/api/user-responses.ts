/**
 * API endpoint for managing user responses to prompts
 * Handles saving and retrieving which options users selected for specific prompts
 * 
 * @module api/user-responses
 */

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import UserResponse from '../../models/UserResponse';

/**
 * Next.js API route handler for user response operations
 * Supports:
 * - GET: Fetch responses by user ID and optionally prompt ID
 * - POST: Save a new user response with duplicate detection
 * 
 * @async
 * @function handler
 * @param {NextApiRequest} req - The Next.js API request object
 * @param {NextApiResponse} res - The Next.js API response object
 * @returns {Promise<void>} Response with status and JSON data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  /**
   * GET handler - Fetch user responses
   * Retrieves responses filtered by userId and optionally promptId
   */
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

  /**
   * POST handler - Save a new user response
   * Records which option a user selected for a prompt
   * Prevents duplicate responses from the same user for the same prompt
   */
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