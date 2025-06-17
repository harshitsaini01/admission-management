import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  centerId: string;
  centerCode: string;
  centerName: string;
  beneficiary: string;
  paymentType: string; // Added
  accountHolderName: string;
  amount: number;
  transactionId: string;
  transactionDate: Date;
  paySlip?: string; // Made optional for system entries
  addedOn: Date; // Added
  status: "Pending" | "Approved" | "Rejected"; // Added
}

const WalletSchema: Schema = new Schema({
  centerId: { type: String, required: true },
  centerCode: { type: String, required: true },
  centerName: { type: String, required: true },
  beneficiary: { type: String, required: true },
  paymentType: { type: String, required: true }, // Added
  accountHolderName: { type: String },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  paySlip: { type: String, required: false }, // Made optional for system entries
  addedOn: { type: Date, default: Date.now }, // Added with default
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Added with default
});

export default mongoose.model<IWallet>("Wallet", WalletSchema);