import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Tournament from "@/models/Tournament";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Please log in to register and pay entry fees." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tournamentId, amount } = body;

    if (!tournamentId || amount === undefined || Number(amount) < 0) {
      return NextResponse.json(
        { success: false, error: "Tournament ID and valid entry fee amount are required." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    await connectToDatabase();

    // 1. Simulation / Sandbox Mode if API keys are not yet configured
    if (!keyId || !keySecret) {
      const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      try {
        await Payment.create({
          user: auth.userId,
          tournament: tournamentId,
          razorpayOrderId: mockOrderId,
          amount: Number(amount),
          currency: "INR",
          status: "created",
        });
      } catch {
        // Continue even if DB query fails in mock mode
      }

      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        keyId: "rzp_test_simulated",
        isMock: true,
        message: "Razorpay keys not configured in .env.local — running in test simulation mode.",
      });
    }

    // 2. Real Razorpay Order Creation via official SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Razorpay amounts are denominated in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        tournamentId: String(tournamentId),
        userId: auth.userId,
        username: auth.username,
      },
    });

    // Record order in MongoDB
    await Payment.create({
      user: auth.userId,
      tournament: tournamentId,
      razorpayOrderId: order.id,
      amount: Number(amount),
      currency: order.currency || "INR",
      status: "created",
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      isMock: false,
    });
  } catch (error: any) {
    console.error("[Razorpay Order Creation Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate Razorpay order." },
      { status: 500 }
    );
  }
}
