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
  university: string; // New field
}

const CenterSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  subCenterAccess: { type: Boolean, required: true },
  status: { type: Boolean, required: true },
  contactNumber: { type: String, required: true },
  wallet: { type: String, required: true },
  password: { type: String, required: true },
  university: { type: String, required: true, enum: ["DU", "IIT", "BHU"] },
}, { timestamps: true });

export default mongoose.model<ICenter>("Center", CenterSchema);