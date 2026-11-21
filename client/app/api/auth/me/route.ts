import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const dbUser = await User.findById(auth.userId).select("-passwordHash");
    if (dbUser) {
      return NextResponse.json({
        success: true,
        user: {
          userId: dbUser._id.toString(),
          email: dbUser.email,
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role,
          avatarUrl: dbUser.avatarUrl,
          whatsappNumber: dbUser.whatsappNumber || "",
          upiId: dbUser.upiId || "",
          gameProfiles: dbUser.gameProfiles || [],
          hasGameId: Boolean(dbUser.gameProfiles && dbUser.gameProfiles.length > 0),
        },
      });
    }
  } catch {
    // Fall back to token auth payload
  }

  return NextResponse.json({
    success: true,
    user: {
      ...auth,
      upiId: "",
      gameProfiles: [],
      hasGameId: false,
    },
  });
}
