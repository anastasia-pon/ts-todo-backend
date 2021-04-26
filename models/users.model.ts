// import mongoose from 'mongoose';
import { Document, model, Schema } from "mongoose";

const UserSchema = new Schema<UserDocument>({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

export interface UserDocument extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default model<UserDocument>('User', UserSchema);
