import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import { formatWhatsAppPhone } from "@/lib/whatsapp";

// POST /api/auth/otp/verify - Verify 6-digit WhatsApp or Email OTP
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { whatsappNumber, email, otp, purpose = "registration" } = body;

    if (!whatsappNumber && !email) {
      return NextResponse.json(
        { success: false, error: "WhatsApp phone number or email is required." },
        { status: 400 }
      );
    }

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "A valid 6-digit OTP code is required." },
        { status: 400 }
      );
    }

    let filter: Record<string, any> = {
      purpose,
      expiresAt: { $gt: new Date() },
    };

    if (email) {
      filter.email = email.toLowerCase().trim();
    } else if (whatsappNumber) {
      const formatted = formatWhatsAppPhone(whatsappNumber);
      filter.whatsappNumber = formatted;
    }

    const record = await OtpVerification.findOne(filter).sort({ createdAt: -1 });

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
    if (!record.verified) {
      record.verified = true;
      await record.save();
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

