import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { formatWhatsAppPhone } from "@/lib/whatsapp";

// POST /api/auth/reset-password - Verify OTP and update user password
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { whatsappNumber, otp, newPassword, confirmPassword } = body;

    if (!whatsappNumber || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "WhatsApp number, OTP, and new password are required." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const formatted = formatWhatsAppPhone(whatsappNumber);

    // Verify OTP record
    const otpRecord = await OtpVerification.findOne({
      whatsappNumber: formatted,
      purpose: "password_reset",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired password reset OTP." },
        { status: 400 }
      );
    }

    // Find the user by phone number
    const user = await User.findOne({
      $or: [
        { whatsappNumber: { $regex: formatted.slice(-10) } },
        { whatsappNumber: formatted },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account matching this WhatsApp number was not found." },
        { status: 404 }
      );
    }

    // Hash new password and update
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Consume OTP record
    await OtpVerification.deleteMany({ whatsappNumber: formatted, purpose: "password_reset" });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
