import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayerStat extends Document {
  user?: mongoose.Types.ObjectId;
  gameId: string; // Character UID (e.g. 5129847291)
  inGameName: string;
  teamName: string;
  game: "bgmi" | "freefire";
  tournament?: mongoose.Types.ObjectId;
  match?: mongoose.Types.ObjectId;
  kills: number;
  placement: number;
  damage?: number;
  matchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerStatSchema = new Schema<IPlayerStat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    gameId: { type: String, required: true, index: true },
    inGameName: { type: String, required: true, trim: true },
    teamName: { type: String, required: true, trim: true, index: true },
    game: { type: String, enum: ["bgmi", "freefire"], required: true, index: true },
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", index: true },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    kills: { type: Number, required: true, default: 0, min: 0 },
    placement: { type: Number, default: 1 },
    damage: { type: Number, default: 0 },
    matchDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const PlayerStat: Model<IPlayerStat> =
  mongoose.models.PlayerStat || mongoose.model<IPlayerStat>("PlayerStat", PlayerStatSchema);

export default PlayerStat;
