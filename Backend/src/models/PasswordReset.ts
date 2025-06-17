import mongoose, { Schema, Document } from "mongoose";

interface IPasswordReset extends Document {
  email: string;
  otp: string;
  userType: "superadmin" | "center";
  centerId?: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const PasswordResetSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    otp: { 
      type: String, 
      required: true,
      length: 6
    },
    userType: { 
      type: String, 
      required: true,
      enum: ["superadmin", "center"]
    },
    centerId: { 
      type: Schema.Types.ObjectId, 
      ref: "Center",
      required: false
    },
    expiresAt: { 
      type: Date, 
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    },
    isUsed: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true,
    // Automatically delete documents after they expire
    index: { expiresAt: 1 }, 
    expireAfterSeconds: 0
  }
);

// Index for faster queries
PasswordResetSchema.index({ email: 1, otp: 1 });
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema); 