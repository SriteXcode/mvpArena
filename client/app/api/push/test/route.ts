import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { sendWebPush } from "@/lib/webpush";

// POST /api/push/test - Dispatch test VAPID push notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscription, title, message } = body;

    const notifTitle = title || "MVP Arena: Scrim Lobby Alert";
    const notifBody = message || "Match 01 custom room ID and password dispatched to authorized roster.";

    // 1. Direct subscription provided in request body
    if (subscription && subscription.endpoint && subscription.keys) {
      const delivered = await sendWebPush(subscription, {
        title: notifTitle,
        body: notifBody,
        url: "/profile",
      });

      return NextResponse.json({
        success: delivered,
        message: delivered
          ? "Test VAPID push delivered to browser subscription."
          : "Delivery attempted but failed. Check subscription keys or VAPID configuration.",
      });
    }

    // 2. Fall back to authenticated user's registered subscriptions
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Provide a subscription object or authenticate with an account that has push subscriptions." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No browser push subscriptions found for this account. Enable notifications first." },
        { status: 404 }
      );
    }

    let successCount = 0;
    for (const sub of user.pushSubscriptions) {
      const ok = await sendWebPush(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh,
          },
        },
        {
          title: notifTitle,
          body: notifBody,
          url: "/profile",
        }
      );
      if (ok) successCount++;
    }

    return NextResponse.json({
      success: true,
      deliveredTo: successCount,
      totalRegistered: user.pushSubscriptions.length,
      message: `Dispatched test VAPID notification to ${successCount} active device(s).`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
