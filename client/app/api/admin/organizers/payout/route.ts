import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Organizer from "@/models/Organizer";
import PayoutTransaction from "@/models/PayoutTransaction";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { organizerId, orgName, upiId, amount, notes } = body;

    if (!organizerId || !amount || !upiId) {
      return NextResponse.json(
        { success: false, error: "Organizer ID, UPI ID, and amount are required" },
        { status: 400 }
      );
    }

    const refId = `PAY-ORG-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const payoutNum = Number(amount);

    const transaction = await PayoutTransaction.create({
      recipientType: "organizer",
      recipientId: organizerId,
      recipientName: orgName || "Tournament Organizer",
      upiId,
      amount: payoutNum,
      transactionType: "organizer_settlement",
      referenceId: refId,
      notes: notes || "Bi-weekly net ticket commission settlement.",
      status: "completed",
    });

    try {
      await Organizer.findByIdAndUpdate(organizerId, {
        $inc: {
          totalSettledPayouts: payoutNum,
          walletBalance: -payoutNum,
        },
        upiId,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `₹${payoutNum.toLocaleString("en-IN")} successfully disbursed to ${orgName || "Organizer"} (${upiId}). Reference: ${refId}`,
      data: transaction,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
