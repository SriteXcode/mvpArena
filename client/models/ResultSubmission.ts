import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResultSubmission extends Document {
  match: mongoose.Types.ObjectId;
  tournament: mongoose.Types.ObjectId;
  teamName: string;
  submittedBy: mongoose.Types.ObjectId;
  submitterRole: "player" | "organizer";
  placement: number;
  eliminations: number;
  evidenceUrl: string; // Cloudinary URL
  notes?: string;
  status: "pending" | "approved" | "rejected" | "disputed";
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSubmissionSchema = new Schema<IResultSubmission>(
  {
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    teamName: { type: String, required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    submitterRole: { type: String, enum: ["player", "organizer"], required: true },
    placement: { type: Number, required: true, min: 1 },
    eliminations: { type: Number, required: true, min: 0, default: 0 },
    evidenceUrl: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "disputed"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const ResultSubmission: Model<IResultSubmission> =
  mongoose.models.ResultSubmission ||
  mongoose.model<IResultSubmission>("ResultSubmission", ResultSubmissionSchema);

export default ResultSubmission;
