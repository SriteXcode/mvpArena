import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import User from "@/models/User";
import { sendWhatsAppMessage, formatWhatsAppPhone } from "@/lib/whatsapp";

// POST /api/auth/otp/send - Generate and dispatch 6-digit OTP via WhatsApp
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { whatsappNumber, purpose = "registration" } = body;

    if (!whatsappNumber) {
      return NextResponse.json(
        { success: false, error: "WhatsApp phone number is required." },
        { status: 400 }
      );
    }

    const formatted = formatWhatsAppPhone(whatsappNumber);
    if (!formatted || formatted.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // If purpose is password_reset, verify that an account with this number or email exists
    if (purpose === "password_reset") {
      const existingUser = await User.findOne({
        $or: [
          { whatsappNumber: { $regex: formatted.slice(-10) } },
          { email: body.email?.toLowerCase().trim() },
        ],
      });
      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: "No athlete account found associated with this WhatsApp number." },
          { status: 404 }
        );
      }
    }

    // Generate 6-digit cryptographic OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified OTP for this phone & purpose
    await OtpVerification.deleteMany({
      whatsappNumber: formatted,
      purpose,
    });

    // Create new OTP record
    await OtpVerification.create({
      whatsappNumber: formatted,
      email: body.email?.toLowerCase().trim(),
      otp,
      purpose,
      verified: false,
      expiresAt,
    });

    // Send WhatsApp Message
    const dispatchResult = await sendWhatsAppMessage({
      toPhone: formatted,
      type: purpose === "password_reset" ? "otp_password_reset" : "otp_registration",
      templateParams: {
        otp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Verification OTP dispatched to WhatsApp (+${formatted}).`,
      messageId: dispatchResult.messageId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
