import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtpVerification extends Document {
  whatsappNumber: string;
  email?: string;
  otp: string;
  purpose: "registration" | "password_reset" | "login";
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    whatsappNumber: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["registration", "password_reset", "login"],
      default: "registration",
      index: true,
    },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: "10m" } },
  },
  { timestamps: true }
);

export const OtpVerification: Model<IOtpVerification> =
  mongoose.models.OtpVerification ||
  mongoose.model<IOtpVerification>("OtpVerification", OtpVerificationSchema);

export default OtpVerification;
