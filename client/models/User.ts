import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameProfile {
  game: "bgmi" | "freefire" | "valorant" | "codm";
  gameId: string;       // e.g. "5129384729"
  inGameName: string;   // e.g. "Mortal_Sniper"
  verified?: boolean;
}

export interface IPushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  createdAt?: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl: string;
  bio: string;
  role: "player" | "organizer" | "super_admin";
  whatsappNumber: string;
  whatsappAlertsEnabled: boolean;
  gameProfiles: IGameProfile[];
  friends: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  pushSubscriptions: IPushSubscription[];
  fcmTokens: string[];
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  walletBalance: number;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameProfileSchema = new Schema<IGameProfile>({
  game: { type: String, enum: ["bgmi", "freefire", "valorant", "codm"], required: true },
  gameId: { type: String, required: true },
  inGameName: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

const PushSubscriptionSchema = new Schema<IPushSubscription>({
  endpoint: { type: String, required: true },
  keys: {
    auth: { type: String, required: true },
    p256dh: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["player", "organizer", "super_admin"], default: "player", index: true },
    whatsappNumber: { type: String, default: "", index: true },
    whatsappAlertsEnabled: { type: Boolean, default: true },
    gameProfiles: { type: [GameProfileSchema], default: [] },
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    pushSubscriptions: { type: [PushSubscriptionSchema], default: [] },
    fcmTokens: { type: [String], default: [] },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
