/**
 * Mongoose model for prompt/question data
 * Represents poll-style questions with multiple response options
 * 
 * @module models/Prompt
 */

// src/models/Prompt.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing a Prompt document in MongoDB
 * 
 * @interface IPrompt
 * @extends Document
 * @property {string} createdBy - ID of the user who created this prompt
 * @property {boolean} isReported - Whether the prompt has been reported by users
 * @property {boolean} isArchived - Whether the prompt has been archived by moderators
 * @property {boolean} isAutoFlagged - Whether the prompt was automatically flagged by content filters
 * @property {string} promptQuestion - The main question text
 * @property {string} resp1 - First response option
 * @property {string} resp2 - Second response option
 * @property {string} resp3 - Third response option
 * @property {string} resp4 - Fourth response option
 */
export interface IPrompt extends Document {
  createdBy: string;
  isReported: boolean;
  isArchived: boolean;
  isAutoFlagged: boolean;
  promptQuestion: string;
  resp1: string;
  resp2: string;
  resp3: string;
  resp4: string;
}

/**
 * Mongoose schema definition for Prompt model
 * Defines fields, data types, and validation rules
 * 
 * @type {Schema}
 */
const PromptSchema: Schema = new mongoose.Schema({
  promptQuestion: { type: String, required: true },
  resp1: { type: String },
  resp2: { type: String },
  resp3: { type: String },
  resp4: { type: String },
  createdBy: { type: String, required: true },
  isReported: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isAutoFlagged: { type: Boolean, default: false }
});

// Check if the model already exists (to prevent OverwriteModelError)
const Prompt: Model<IPrompt> =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

export default Prompt;

