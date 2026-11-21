import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { sendEmail } from "@/lib/email";

// POST /api/auth/forgot-password/email - Dispatch password reset OTP & link to email
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No athlete account found registered with this email address." },
        { status: 404 }
      );
    }

    // Generate 6-digit reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any previous pending reset tokens for this email
    await OtpVerification.deleteMany({ email: normalizedEmail, purpose: "password_reset" });

    // Store in OtpVerification
    await OtpVerification.create({
      whatsappNumber: user.whatsappNumber || "email_reset",
      email: normalizedEmail,
      otp,
      purpose: "password_reset",
      verified: false,
      expiresAt,
    });

    const resetUrl = `https://mvparena.gg/profile?reset=email&email=${encodeURIComponent(normalizedEmail)}&code=${otp}`;

    // Dispatch email
    await sendEmail({
      to: normalizedEmail,
      subject: "🔐 Reset Your MVP Arena Password",
      type: "password_reset",
      templateParams: {
        name: user.name,
        resetToken: otp,
        resetUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset instructions and 6-digit code have been dispatched to ${normalizedEmail}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
