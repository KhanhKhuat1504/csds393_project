import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  accountCreated: boolean;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true },
  accountCreated: { type: Boolean, default: false }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

