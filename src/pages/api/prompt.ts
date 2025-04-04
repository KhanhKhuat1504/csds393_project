// pages/api/prompt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import Prompt from '../../models/Prompt';
import { isInappropriate } from '@/lib/moderation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Debug: Log request headers to inspect the Authorization header
  console.log("Request headers:", req.headers);

  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { promptQuestion, resp1, resp2, resp3, resp4 } = req.body;
      let autoFlagged = false;
      const textsToCheck = [promptQuestion, resp1, resp2, resp3, resp4].filter(Boolean);

      // Check each text for inappropriate content
      for (const text of textsToCheck) {
        if (await isInappropriate(text)) {
          autoFlagged = true;
          console.log(`Inappropriate content detected in text: "${text}"`);
          break;
        }
      }
      // Add the auto flag status to the request body
      req.body.isAutoFlagged = autoFlagged;
      // Create the new prompt in the database
      const newPrompt = await Prompt.create(req.body);
      // If the prompt is auto flagged, return a special message to the user
      if (autoFlagged) {
        return res.status(201).json({
          success: true,
          message: "Your prompt has been flagged and is pending moderator review.",
          data: newPrompt,
        });
      }
      res.status(201).json({ success: true, data: newPrompt });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;
      const updatedPrompt = await Prompt.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPrompt) {
        return res.status(404).json({ success: false, message: 'Prompt not found' });
      }
      res.status(200).json({ success: true, data: updatedPrompt });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      // Check if an ID is provided for fetching a specific prompt
      const { id } = req.query;
      
      if (id) {
        const prompt = await Prompt.findById(id);
        if (!prompt) {
          return res.status(404).json({ success: false, message: 'Prompt not found' });
        }
        return res.status(200).json({ success: true, data: prompt });
      }
      
      // Otherwise return all prompts
      const prompts = await Prompt.find({});
      res.status(200).json({ success: true, data: prompts });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required for deletion' });
      }
      
      const deletedPrompt = await Prompt.findByIdAndDelete(id);
      
      if (!deletedPrompt) {
        return res.status(404).json({ success: false, message: 'Prompt not found' });
      }
      
      res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
