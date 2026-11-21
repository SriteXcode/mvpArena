import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  subject: string;
  content: string;
  targetAudience: "all" | "players" | "organizers";
  ctaText?: string;
  ctaUrl?: string;
  sentBy: mongoose.Types.ObjectId;
  recipientCount: number;
  status: "sent" | "draft";
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ["all", "players", "organizers"],
      default: "all",
      index: true,
    },
    ctaText: { type: String, default: "Explore Now" },
    ctaUrl: { type: String, default: "https://mvparena.gg" },
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientCount: { type: Number, default: 0 },
    status: { type: String, enum: ["sent", "draft"], default: "sent" },
    sentAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
