import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { getCurrentUser } from "@/lib/auth";

// GET /api/teams/my-team - Get authenticated athlete's active squad
export async function GET() {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ success: true, data: null });
    }

    // Find team where user is either the captain or an active member
    const team = await Team.findOne({
      $or: [
        { captain: auth.userId },
        { "members.user": auth.userId, "members.status": "active" },
      ],
    }).populate("captain", "name username avatarUrl email");

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/teams/my-team - Update squad details (captain only)
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, tag, bio, logoUrl, game } = body;

    const team = await Team.findOne({ captain: auth.userId });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Only the squad captain can update team settings." },
        { status: 403 }
      );
    }

    if (name) team.name = name.trim();
    if (tag) team.tag = tag.trim().toUpperCase();
    if (bio !== undefined) team.bio = bio;
    if (logoUrl) team.logoUrl = logoUrl;
    if (game) team.game = game;

    await team.save();

    return NextResponse.json({
      success: true,
      message: "Squad profile updated successfully.",
      data: team,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
