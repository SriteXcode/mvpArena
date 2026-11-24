import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import { formatWhatsAppPhone, sendWhatsAppText } from "@/lib/whatsapp";

// ==============================================================================
// GET /api/whatsapp/webhook 
// Meta WhatsApp Cloud API Webhook Handshake & Verification
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken =
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "mvparena_webhook_secret_2026";

    // Meta Webhook verification handshake
    if (mode === "subscribe" && token === expectedToken) {
      console.log("✅ [WhatsApp Webhook] Verification handshake successful!");
      return new Response(challenge || "", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("⚠️ [WhatsApp Webhook] Verification handshake failed. Token mismatch.", {
      receivedToken: token,
      expectedToken: expectedToken ? "[CONFIGURED]" : "[NOT CONFIGURED]",
    });

    return new Response("Forbidden: Invalid verify token", { status: 403 });
  } catch (err) {
    console.error("❌ [WhatsApp Webhook GET Error]:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// ==============================================================================
// POST /api/whatsapp/webhook
// Inbound WhatsApp Messages & Status Delivery Receipts Event Ingestion
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Optional Signature Verification (Meta X-Hub-Signature-256)
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signature = req.headers.get("x-hub-signature-256");

    if (appSecret && signature) {
      const hmac = crypto.createHmac("sha256", appSecret);
      const digest = "sha256=" + hmac.update(rawBody).digest("hex");
      if (signature !== digest) {
        console.warn("⚠️ [WhatsApp Webhook] Invalid HMAC signature.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Parse JSON payload
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 2. Validate WhatsApp Business Account event structure
    if (body.object !== "whatsapp_business_account" && !body.entry) {
      return NextResponse.json({ status: "IGNORED_NOT_WHATSAPP" }, { status: 200 });
    }

    // Process all entries in parallel / sequentially
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        if (!value) continue;

        // --------------------------------------------------------------------
        // A. Delivery Status Updates (sent, delivered, read, failed)
        // --------------------------------------------------------------------
        if (Array.isArray(value.statuses)) {
          for (const statusItem of value.statuses) {
            console.log(
              `📬 [WhatsApp Status Update] Msg ID: ${statusItem.id} | Recipient: ${statusItem.recipient_id} | Status: ${statusItem.status}`
            );
            if (statusItem.status === "failed") {
              console.warn(
                `❌ [WhatsApp Status Failed] Errors:`,
                JSON.stringify(statusItem.errors || [])
              );
            }
          }
        }

        // --------------------------------------------------------------------
        // B. Inbound Messages from Athletes / Users
        // --------------------------------------------------------------------
        if (Array.isArray(value.messages)) {
          for (const message of value.messages) {
            const senderPhone = message.from; // e.g. "919876543210"
            const messageType = message.type;
            const messageId = message.id;

            console.log(
              `💬 [WhatsApp Inbound Message] From: +${senderPhone} | Type: ${messageType} | ID: ${messageId}`
            );

            if (messageType === "text" && message.text?.body) {
              const text = message.text.body.trim();
              const formattedPhone = formatWhatsAppPhone(senderPhone);

              // AUTOMATION 1: Two-Way OTP Verification
              // If the user replies with a 6-digit number, automatically verify the pending OTP in DB
              if (/^\d{6}$/.test(text)) {
                try {
                  await connectToDatabase();
                  const phoneDigits = formattedPhone.slice(-10);

                  const pendingOtp = await OtpVerification.findOne({
                    whatsappNumber: { $regex: phoneDigits },
                    otp: text,
                    verified: false,
                    expiresAt: { $gt: new Date() },
                  }).sort({ createdAt: -1 });

                  if (pendingOtp) {
                    pendingOtp.verified = true;
                    await pendingOtp.save();
                    console.log(
                      `✅ [WhatsApp Automated OTP] Verified OTP ${text} for user phone +${formattedPhone}`
                    );

                    // Send instant WhatsApp confirmation back to the athlete
                    await sendWhatsAppText(
                      formattedPhone,
                      `✅ *MVP ARENA VERIFICATION SUCCESSFUL* ✅\n\nYour OTP *${text}* has been verified automatically! You may now return to the app to continue.`
                    );
                    continue;
                  }
                } catch (otpErr) {
                  console.error("Error auto-verifying OTP via WhatsApp reply:", otpErr);
                }
              }

              // AUTOMATION 2: Interactive Bot / Help Command
              const lowerText = text.toLowerCase();
              if (lowerText === "help" || lowerText === "menu" || lowerText === "hi" || lowerText === "hello") {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mvparena.gg";
                await sendWhatsAppText(
                  formattedPhone,
                  `🎮 *MVP ARENA AUTOMATED ASSISTANT* 🎮\n\n` +
                  `Welcome to MVP Arena esports operations.\n\n` +
                  `📌 *Quick Help Options:*\n` +
                  `• *Verify OTP:* Simply reply directly with your 6-digit OTP code.\n` +
                  `• *Tournaments:* Explore and join active scrims at ${appUrl}/tournaments\n` +
                  `• *Support:* Need help with payouts or lobbies? Email support@mvparena.gg\n\n` +
                  `See you on the battlegrounds, Athlete!`
                );
              }
            }
          }
        }
      }
    }

    // Always acknowledge receipt to Meta to prevent retry loops
    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err) {
    console.error("❌ [WhatsApp Webhook POST Error]:", err);
    // Return 200 or 500
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
