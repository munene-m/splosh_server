import mongoose, { Document } from "mongoose";

interface UserDoc extends Document {
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
  refreshToken: string;
  verificationToken: string | null;
  isVerified: boolean;
  isAgent: boolean;
  isAdmin: boolean;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationToken: { type: String },
    phoneNumber: { type: String },
    refreshToken: { type: String },
    isVerified: { type: Boolean, default: false },
    isAgent: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model<UserDoc>("User", userSchema);
export { User };
