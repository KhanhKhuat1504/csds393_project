import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../lib/dbConnect'; // adjust the path if needed

// Define a Mongoose schema (only once — you could move this to a separate file too)
const promptSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

// Create or reuse the model (prevents redefining the model on every request in dev mode)
const Prompt = mongoose.models.Prompt || mongoose.model('Prompt', promptSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const prompts = await Prompt.find({});
    return res.status(200).json(prompts.map(p => p.text));  // Return only text array
  }

  if (req.method === 'POST') {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const newPrompt = new Prompt({ text });
    await newPrompt.save();

    return res.status(201).json({ message: "Prompt saved" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
