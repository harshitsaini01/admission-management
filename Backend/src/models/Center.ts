import mongoose, { Schema, Document } from "mongoose";

interface ICenter extends Document {
  name: string;
  email: string;
  code: string;
  subCenterAccess: boolean;
  status: boolean;
  contactNumber: string;
  walletBalance: number; // Changed from wallet (String) to walletBalance (Number)
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
      minlength: 4,
      match: /^\d{4}$/,
    },
    subCenterAccess: { type: Boolean, required: true, default: false },
    status: { type: Boolean, required: true, default: true },
    contactNumber: { type: String, required: true },
    walletBalance: { type: Number, required: true, default: 0 }, // Changed to Number
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICenter>("Center", CenterSchema);