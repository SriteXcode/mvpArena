import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScoringRules {
  placementPoints: Record<string, number>; // e.g. {"1": 15, "2": 12, "3": 10, ...}
  eliminationPoints: number; // e.g. 1
}

export interface IRankPrize {
  rank: string; // e.g. "1st Place (Champion)", "2nd Place", "3rd Place"
  reward: number; // e.g. 7500
  percentage?: number; // e.g. 50
}

export interface ITournament extends Document {
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  organizer: mongoose.Types.ObjectId;
  bannerUrl: string;
  streamUrl?: string;
  youtubeStreamUrl?: string;
  description: string;
  entryFee: number; // In INR (0 for free)
  prizePool: number; // In INR
  prizeDistribution?: IRankPrize[];
  maxSlots: number;
  registeredSlots: number;
  registrationStart: Date;
  registrationEnd: Date;
  tournamentDate: Date;
  status: "draft" | "registration_open" | "registration_closed" | "live" | "completed" | "cancelled";
  commissionRateSnapshot: number; // Snapshot of organizer commission at publish time
  scoringRules: IScoringRules;
  rules: string;
  codeOfConduct?: string;
  visibility: "public" | "private";
  privateToken?: string;
  matchRoomCredentials?: {
    roomId: string;
    roomPassword: string;
    announcedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    game: { type: String, enum: ["bgmi", "freefire"], required: true, index: true },
    format: { type: String, enum: ["solo", "duo", "squad"], default: "squad" },
    organizer: { type: Schema.Types.ObjectId, ref: "Organizer", required: true, index: true },
    bannerUrl: { type: String, default: "" },
    streamUrl: { type: String, default: "" },
    youtubeStreamUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    prizeDistribution: [
      {
        rank: { type: String, required: true },
        reward: { type: Number, required: true },
        percentage: { type: Number },
      },
    ],
    maxSlots: { type: Number, default: 25 }, // e.g. 25 squads = 100 players
    registeredSlots: { type: Number, default: 0 },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    tournamentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "registration_open", "registration_closed", "live", "completed", "cancelled"],
      default: "registration_open",
      index: true,
    },
    commissionRateSnapshot: { type: Number, default: 10.0 },
    scoringRules: {
      placementPoints: {
        type: Map,
        of: Number,
        default: {
          "1": 15,
          "2": 12,
          "3": 10,
          "4": 8,
          "5": 6,
          "6": 4,
          "7": 2,
          "8": 1,
          "9": 1,
          "10": 1,
          "11": 0,
        },
      },
      eliminationPoints: { type: Number, default: 1.0 },
    },
    rules: { type: String, default: "Standard esports competitive guidelines apply. Mobile devices only. Emulators prohibited." },
    codeOfConduct: { type: String, default: "Esports fair play policy applies. Toxicity, abusive language, cheating, and falsified results lead to instant disqualification." },
    visibility: { type: String, enum: ["public", "private"], default: "public", index: true },
    privateToken: { type: String, sparse: true, index: true },
    matchRoomCredentials: {
      roomId: { type: String, default: "" },
      roomPassword: { type: String, default: "" },
      announcedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
