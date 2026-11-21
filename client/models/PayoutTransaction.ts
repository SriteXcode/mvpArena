import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayoutTransaction extends Document {
  recipientType: "user" | "organizer";
  recipientId: string;
  recipientName: string;
  upiId: string;
  amount: number;
  transactionType: "prize_winning" | "organizer_settlement" | "wallet_credit";
  referenceId: string;
  notes?: string;
  status: "completed" | "processing" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PayoutTransactionSchema = new Schema<IPayoutTransaction>(
  {
    recipientType: { type: String, enum: ["user", "organizer"], required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    upiId: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: ["prize_winning", "organizer_settlement", "wallet_credit"],
      default: "prize_winning",
    },
    referenceId: { type: String, required: true, unique: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["completed", "processing", "failed"], default: "completed" },
  },
  { timestamps: true }
);

export const PayoutTransaction: Model<IPayoutTransaction> =
  mongoose.models.PayoutTransaction ||
  mongoose.model<IPayoutTransaction>("PayoutTransaction", PayoutTransactionSchema);

export default PayoutTransaction;
