import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  matchNumber: number;
  scheduledAt: Date;
  roomId?: string;
  roomPassword?: string;
  credentialsReleasedAt?: Date;
  status: "scheduled" | "live" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    matchNumber: { type: Number, required: true },
    scheduledAt: { type: Date, required: true },
    roomId: { type: String, default: "" },
    roomPassword: { type: String, default: "" },
    credentialsReleasedAt: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
  },
  { timestamps: true }
);

export const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;
