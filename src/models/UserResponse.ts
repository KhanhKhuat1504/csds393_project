/**
 * Mongoose model for user responses to prompts
 * Tracks which response option a user selected for a specific prompt
 * 
 * @module models/UserResponse
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Interface representing a UserResponse document in MongoDB
 * 
 * @interface IUserResponse
 * @extends Document
 * @property {string} userId - ID of the user who responded
 * @property {string} promptId - ID of the prompt being responded to
 * @property {string} selectedResponse - The response option selected by the user
 * @property {Date} responseDate - Timestamp when the response was recorded
 */
interface IUserResponse extends Document {
  userId: string;
  promptId: string;
  selectedResponse: string;
  responseDate: Date;
}

/**
 * Mongoose schema definition for UserResponse model
 * Defines fields, data types, and timestamp behavior
 * 
 * @type {Schema}
 */
const UserResponseSchema: Schema = new Schema({
  userId: { type: String, required: true },
  promptId: { type: String, required: true },
  selectedResponse: { type: String, required: true },
  responseDate: { type: Date, default: Date.now }
});

/**
 * Unique compound index to ensure a user can only respond to a prompt once
 * Prevents duplicate responses from the same user to the same prompt
 */
UserResponseSchema.index({ userId: 1, promptId: 1 }, { unique: true });

const UserResponse: Model<IUserResponse> = mongoose.models.UserResponse || 
  mongoose.model<IUserResponse>('UserResponse', UserResponseSchema);

export default UserResponse; 