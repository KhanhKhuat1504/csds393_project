// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  accountCreated: { type: Boolean, default: false }
});

// Prevent model overwrite in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
