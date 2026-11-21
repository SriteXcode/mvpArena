import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | "match_credentials"
    | "result_approved"
    | "result_rejected"
    | "game_invite"
    | "friend_request"
    | "tournament_update"
    | "system";
  link: string;
  isRead: boolean;
  channelsDispatched: {
    socket: boolean;
    webPush: boolean;
    fcm: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "match_credentials",
        "result_approved",
        "result_rejected",
        "game_invite",
        "friend_request",
        "tournament_update",
        "system",
      ],
      required: true,
    },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
    channelsDispatched: {
      socket: { type: Boolean, default: false },
      webPush: { type: Boolean, default: false },
      fcm: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
