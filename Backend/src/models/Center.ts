import mongoose, { Schema, Document } from "mongoose";

interface ICenter extends Document {
  name: string;
  email: string;
  code: string;
  subCenterAccess: boolean;
  status: boolean;
  contactNumber: string;
  wallet: string;
  password: string;
}

const CenterSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 4,
      minlength: 4, // Enforce exactly 4 digits
      match: /^\d{4}$/, // Ensure it's a 4-digit number
    },
    subCenterAccess: { type: Boolean, required: true, default: false },
    status: { type: Boolean, required: true, default: true },
    contactNumber: { type: String, required: true },
    wallet: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICenter>("Center", CenterSchema);