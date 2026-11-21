import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

// POST /api/push/subscribe - Register athlete's browser push subscription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: "Valid push subscription object required" },
        { status: 400 }
      );
    }

    const auth = await getCurrentUser();
    if (auth) {
      await connectToDatabase();
      await User.findByIdAndUpdate(auth.userId, {
        $addToSet: { pushSubscriptions: subscription },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Browser push subscription registered successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
