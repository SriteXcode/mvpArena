import mongoose, { Schema, Document, Model } from "mongoose";

export type TacticalRole = "captain" | "igl" | "assaulter" | "sniper" | "support" | "substitute";

export interface ITeamMember {
  user?: mongoose.Types.ObjectId;
  gameId: string; // Character UID (e.g. 5129847291)
  inGameName: string;
  role: TacticalRole;
  status: "active" | "invited" | "declined";
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  tag: string; // e.g. "SOUL", "GODL"
  logoUrl?: string;
  game: "bgmi" | "freefire" | "all";
  captain: mongoose.Types.ObjectId;
  members: ITeamMember[];
  bio?: string;
  matchesPlayed: number;
  wins: number;
  totalKills: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  gameId: { type: String, required: true },
  inGameName: { type: String, default: "Player" },
  role: {
    type: String,
    enum: ["captain", "igl", "assaulter", "sniper", "support", "substitute"],
    default: "assaulter",
  },
  status: {
    type: String,
    enum: ["active", "invited", "declined"],
    default: "active",
  },
  joinedAt: { type: Date, default: Date.now },
});

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    tag: { type: String, required: true, trim: true, uppercase: true },
    logoUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200",
    },
    game: { type: String, enum: ["bgmi", "freefire", "all"], default: "bgmi", index: true },
    captain: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [TeamMemberSchema], default: [] },
    bio: { type: String, default: "Official competitive roster on MVP Arena." },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    totalKills: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
