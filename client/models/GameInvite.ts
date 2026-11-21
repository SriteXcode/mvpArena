import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameInvite extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  targetGameId: string; // e.g. player BGMI ID or Free Fire UID
  game: "bgmi" | "freefire" | "valorant" | "codm";
  tournament?: mongoose.Types.ObjectId;
  teamName: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const GameInviteSchema = new Schema<IGameInvite>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", index: true },
    targetGameId: { type: String, required: true, index: true },
    game: { type: String, enum: ["bgmi", "freefire", "valorant", "codm"], required: true },
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament" },
    teamName: { type: String, default: "" },
    message: { type: String, default: "Join our tournament squad on PlayArena!" },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export const GameInvite: Model<IGameInvite> =
  mongoose.models.GameInvite || mongoose.model<IGameInvite>("GameInvite", GameInviteSchema);

export default GameInvite;
