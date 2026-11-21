import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizer extends Document {
  user: mongoose.Types.ObjectId;
  orgName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commissionRate: number; // e.g. 10.0 for 10%
  upiId?: string; // Payout UPI ID
  walletBalance: number;
  totalSettledPayouts: number;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizerSchema = new Schema<IOrganizer>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    orgName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    commissionRate: { type: Number, default: 10.0 }, // Super-admin controlled
    upiId: { type: String, default: "nova.esports@okhdfcbank" },
    walletBalance: { type: Number, default: 0 },
    totalSettledPayouts: { type: Number, default: 0 },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Organizer: Model<IOrganizer> =
  mongoose.models.Organizer || mongoose.model<IOrganizer>("Organizer", OrganizerSchema);

export default Organizer;
