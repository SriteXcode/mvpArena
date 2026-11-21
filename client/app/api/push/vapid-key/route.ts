import { NextResponse } from "next/server";
import { VAPID_PUBLIC_KEY } from "@/lib/webpush";

// GET /api/push/vapid-key - Retrieve public VAPID key for browser push subscription
export async function GET() {
  return NextResponse.json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
}
