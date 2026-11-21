import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// POST /api/email/test - Dispatch test email and report provider used
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { to, subject } = body;

    const targetEmail = to || process.env.SMTP_USER || "test@example.com";
    const emailSubject = subject || "🚀 MVP Arena Email Dispatch Test";

    const resendActive = Boolean(process.env.RESEND_API_KEY);
    const sendgridActive = Boolean(process.env.SENDGRID_API_KEY);
    const smtpActive = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    const provider = smtpActive
      ? "SMTP (Gmail / Custom Host)"
      : resendActive
      ? "Resend REST API"
      : sendgridActive
      ? "SendGrid v3 API"
      : "Console Simulation Mode (Check your terminal log)";

    const result = await sendEmail({
      to: targetEmail,
      subject: emailSubject,
      type: "campaign",
      templateParams: {
        campaignTitle: "MVP Arena Test Dispatch",
        campaignBody: `This is a test notification dispatched from MVP Arena on ${new Date().toLocaleString()}.\n\nIf you see this, your email configuration (${provider}) is operational!`,
        ctaText: "Go to Arena",
        ctaUrl: "http://localhost:3000",
      },
    });

    return NextResponse.json({
      success: result.success,
      providerConfigured: provider,
      recipient: targetEmail,
      messageId: result.messageId,
      message: `Test email processed via ${provider}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
