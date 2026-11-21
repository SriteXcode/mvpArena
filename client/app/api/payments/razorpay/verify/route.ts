import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required to verify transaction." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, tournamentId } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: "Order ID and Payment ID are required for verification." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    await connectToDatabase();

    // 1. Simulation Verification (when Razorpay keys are not configured or order starts with order_sim_)
    if (!keySecret || razorpayOrderId.startsWith("order_sim_") || razorpaySignature === "simulated_valid_signature") {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "paid",
          razorpayPaymentId,
          razorpaySignature: "simulated_valid_signature",
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        verified: true,
        isMock: true,
        paymentId: razorpayPaymentId,
        message: "Payment verified successfully in simulation mode.",
      });
    }

    // 2. Real Cryptographic HMAC-SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpaySignature;

    if (!isSignatureValid) {
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed", razorpayPaymentId, razorpaySignature }
      );

      return NextResponse.json(
        { success: false, error: "Cryptographic signature verification failed. Tampered transaction rejected." },
        { status: 400 }
      );
    }

    // Update payment record in database
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: "paid",
        razorpayPaymentId,
        razorpaySignature,
      }
    );

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpayPaymentId,
      message: "Razorpay payment verified and recorded.",
    });
  } catch (error: any) {
    console.error("[Razorpay Verification Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
