import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    // Default to the main demo player
    const user = await User.findOne({ username: "viper_esports" });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const user = await User.findOne({ username: "viper_esports" });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (body.whatsappNumber !== undefined) {
      user.whatsappNumber = body.whatsappNumber;
    }
    if (body.whatsappAlertsEnabled !== undefined) {
      user.whatsappAlertsEnabled = body.whatsappAlertsEnabled;
    }
    if (body.gameProfile) {
      // Upsert game profile for that game
      const existingIdx = user.gameProfiles.findIndex((g) => g.game === body.gameProfile.game);
      if (existingIdx >= 0) {
        user.gameProfiles[existingIdx] = body.gameProfile;
      } else {
        user.gameProfiles.push(body.gameProfile);
      }
    }

    await user.save();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
