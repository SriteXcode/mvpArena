import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import { formatWhatsAppPhone } from "@/lib/whatsapp";

// POST /api/auth/otp/verify - Verify 6-digit WhatsApp OTP
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { whatsappNumber, otp, purpose = "registration" } = body;

    if (!whatsappNumber || !otp) {
      return NextResponse.json(
        { success: false, error: "WhatsApp phone number and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    const formatted = formatWhatsAppPhone(whatsappNumber);

    const record = await OtpVerification.findOne({
      whatsappNumber: formatted,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "OTP expired or not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP code. Please double-check and retry." },
        { status: 400 }
      );
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    return NextResponse.json({
      success: true,
      message: "WhatsApp number verified successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
