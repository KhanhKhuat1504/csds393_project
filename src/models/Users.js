// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    
  accountCreated: { type: Boolean, default: false }
});

// Prevent model overwrite in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
