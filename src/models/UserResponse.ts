import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUserResponse extends Document {
  userId: string;
  promptId: string;
  selectedResponse: string;
  responseDate: Date;
}

const UserResponseSchema: Schema = new Schema({
  userId: { type: String, required: true },
  promptId: { type: String, required: true },
  selectedResponse: { type: String, required: true },
  responseDate: { type: Date, default: Date.now }
});

// Create a compound index to ensure a user can only respond to a prompt once
UserResponseSchema.index({ userId: 1, promptId: 1 }, { unique: true });

const UserResponse: Model<IUserResponse> = mongoose.models.UserResponse || 
  mongoose.model<IUserResponse>('UserResponse', UserResponseSchema);

export default UserResponse; 