import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import PayoutTransaction from "@/models/PayoutTransaction";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole(["super_admin"]);
    await connectToDatabase();
    const dbUsers = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: dbUsers || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["super_admin"]);
    await connectToDatabase();
    const body = await request.json();
    const { userId, recipientName, upiId, amount, transactionType, notes } = body;

    if (!recipientName || !upiId || !amount) {
      return NextResponse.json(
        { success: false, error: "Recipient name, UPI ID, and amount are required" },
        { status: 400 }
      );
    }

    const refId = `PAY-USR-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const transaction = await PayoutTransaction.create({
      recipientType: "user",
      recipientId: userId || `usr_${Date.now()}`,
      recipientName,
      upiId,
      amount: Number(amount),
      transactionType: transactionType || "prize_winning",
      referenceId: refId,
      notes: notes || "Manual admin payout processed to player UPI.",
      status: "completed",
    });

    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $inc: { walletBalance: Number(amount) },
          upiId,
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `₹${amount} successfully disbursed to ${recipientName} (${upiId}). Reference: ${refId}`,
      data: transaction,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
