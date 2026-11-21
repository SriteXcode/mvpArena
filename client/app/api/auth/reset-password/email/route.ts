import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { hashPassword } from "@/lib/auth";

// POST /api/auth/reset-password/email - Verify email OTP and update password
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, OTP code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP record
    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      purpose: "password_reset",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code. Please request a new code." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // Hash and update password
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Delete used OTP
    await OtpVerification.deleteMany({ email: normalizedEmail, purpose: "password_reset" });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
