/**
 * Mongoose model for user data
 * Stores user profile information integrated with Clerk authentication
 * 
 * @module models/User
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Interface representing a User document in MongoDB
 * 
 * @interface IUser
 * @extends Document
 * @property {string} clerkId - Unique identifier from Clerk authentication service
 * @property {string} email - User's email address
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} gender - User's gender (for demographic analysis)
 * @property {boolean} accountCreated - Whether the user has completed profile setup
 * @property {string} position - User's academic position/level (e.g., freshman, sophomore)
 * @property {number} year - User's birth year (for demographic analysis)
 * @property {boolean} isMod - Whether the user has moderator privileges
 */
interface IUser extends Document {
  clerkId: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  accountCreated: boolean;
  position: string;
  year: number; 
  isMod: boolean;
}

/**
 * Mongoose schema definition for User model
 * Defines fields, data types, defaults, and validation rules
 * 
 * @type {Schema}
 */
const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  gender: { type: String, default: "" },
  accountCreated: { type: Boolean, default: false },
  position: { type: String, default: "" },
  year: { type: Number, default: 2000}, 
  isMod: { type: Boolean, default: false },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

