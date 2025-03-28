// pages/api/prompt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import Prompt from '../../models/Prompt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Debug: Log request headers to inspect the Authorization header
  console.log("Request headers:", req.headers);

  await dbConnect();

  if (req.method === 'POST') {
    try {
      // Create a new prompt
      const newPrompt = await Prompt.create(req.body);
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
