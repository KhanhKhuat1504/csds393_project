import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  accountCreated: boolean;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  gender: { type: String, default: "" },
  accountCreated: { type: Boolean, default: false },
  year: { type: String, default: "" },
  
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

