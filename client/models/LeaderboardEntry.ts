import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaderboardEntry extends Document {
  tournament: mongoose.Types.ObjectId;
  match?: mongoose.Types.ObjectId;
  teamName: string;
  gameIdTag: string; // e.g. BGMI ID or Captain's IGN
  placement: number;
  placementPoints: number;
  eliminationPoints: number;
  totalPoints: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    teamName: { type: String, required: true },
    gameIdTag: { type: String, default: "" },
    placement: { type: Number, default: 0 },
    placementPoints: { type: Number, default: 0 },
    eliminationPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0, index: true },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LeaderboardEntry: Model<ILeaderboardEntry> =
  mongoose.models.LeaderboardEntry ||
  mongoose.model<ILeaderboardEntry>("LeaderboardEntry", LeaderboardEntrySchema);

export default LeaderboardEntry;
