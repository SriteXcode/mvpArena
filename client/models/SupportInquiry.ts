import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupportInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  category: "dispute" | "payout" | "partnership" | "general";
  subject: string;
  message: string;
  status: "unread" | "in_progress" | "resolved";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportInquirySchema = new Schema<ISupportInquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    category: {
      type: String,
      enum: ["dispute", "payout", "partnership", "general"],
      default: "general",
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["unread", "in_progress", "resolved"],
      default: "unread",
      index: true,
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SupportInquiry: Model<ISupportInquiry> =
  mongoose.models.SupportInquiry ||
  mongoose.model<ISupportInquiry>("SupportInquiry", SupportInquirySchema);

export default SupportInquiry;
