import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// POST /api/admin/whatsapp/test
// Test Meta WhatsApp Cloud API endpoint directly
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toPhone, token, phoneId, templateName, parameters } = body;

    if (!toPhone) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number ('toPhone') is required. e.g. '919876543210'" },
        { status: 400 }
      );
    }

    // Allow overriding token and phoneId dynamically for on-the-fly testing
    if (token) {
      process.env.WHATSAPP_API_TOKEN = token;
    }
    if (phoneId) {
      process.env.WHATSAPP_PHONE_ID = phoneId;
    }

    const result = await sendWhatsAppMessage({
      toPhone,
      type: "template_test",
      templateParams: {
        templateName: templateName || "jaspers_market_order_confirmation_v1",
        templateLanguage: "en_US",
        templateBodyParameters: Array.isArray(parameters) && parameters.length > 0
          ? parameters
          : ["Athlete Commander", "MVP-99821", new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
      },
    });

    return NextResponse.json({
      success: result.success,
      endpoint: `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_ID || "1406383182562797"}/messages`,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
