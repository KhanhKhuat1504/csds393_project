// src/models/Prompt.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrompt extends Document {
  promptQuestion: string;
  resp1: string;
  resp2: string;
  resp3: string;
  resp4: string;
}

const PromptSchema: Schema = new mongoose.Schema({
  promptQuestion: { type: String, required: true },
  resp1: { type: String },
  resp2: { type: String },
  resp3: { type: String },
  resp4: { type: String },
});

// Check if the model already exists (to prevent OverwriteModelError)
const Prompt: Model<IPrompt> =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

export default Prompt;

