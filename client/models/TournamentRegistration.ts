import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISquadMember {
  user?: mongoose.Types.ObjectId;
  gameId: string; // IGN or Character UID
  inGameName: string;
  role: "captain" | "member" | "substitute";
  status: "confirmed" | "invited_pending";
  joinedAt: Date;
}

export interface ITournamentRegistration extends Document {
  tournament: mongoose.Types.ObjectId;
  teamName: string;
  format: "solo" | "duo" | "squad";
  captain: mongoose.Types.ObjectId;
  squadToken: string; // e.g. "SQ-8F29A"
  members: ISquadMember[];
  maxMembers: number; // 1 for solo, 2 for duo, 4 for squad
  isEarlyLocked: boolean; // Captain finalized and reserved slot early
  rosterLockedAt?: Date; // 10 minutes before match kickoff
  paymentStatus: "completed" | "free" | "pending";
  paymentId?: string;
  credentialsDelivered: boolean;
  roomCredentials?: {
    roomId: string;
    roomPassword: string;
    deliveredAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SquadMemberSchema = new Schema<ISquadMember>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  gameId: { type: String, required: true },
  inGameName: { type: String, default: "Player" },
  role: { type: String, enum: ["captain", "member", "substitute"], default: "member" },
  status: { type: String, enum: ["confirmed", "invited_pending"], default: "confirmed" },
  joinedAt: { type: Date, default: Date.now },
});

const TournamentRegistrationSchema = new Schema<ITournamentRegistration>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    teamName: { type: String, required: true, trim: true },
    format: { type: String, enum: ["solo", "duo", "squad"], default: "squad" },
    captain: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    squadToken: { type: String, required: true, unique: true, index: true },
    members: { type: [SquadMemberSchema], default: [] },
    maxMembers: { type: Number, default: 4 },
    isEarlyLocked: { type: Boolean, default: true },
    rosterLockedAt: { type: Date },
    paymentStatus: { type: String, enum: ["completed", "free", "pending"], default: "completed" },
    paymentId: { type: String },
    credentialsDelivered: { type: Boolean, default: false },
    roomCredentials: {
      roomId: { type: String },
      roomPassword: { type: String },
      deliveredAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const TournamentRegistration: Model<ITournamentRegistration> =
  mongoose.models.TournamentRegistration ||
  mongoose.model<ITournamentRegistration>("TournamentRegistration", TournamentRegistrationSchema);

export default TournamentRegistration;
