import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

// GET /api/teams - List all teams or search
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (game && game !== "all") {
      query.game = { $in: [game, "all"] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
      ];
    }

    const teams = await Team.find(query)
      .populate("captain", "name username avatarUrl")
      .sort({ wins: -1, totalKills: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new squad
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required to found a squad." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, tag, game, logoUrl, bio, captainGameId, captainIgn } = body;

    if (!name || !tag) {
      return NextResponse.json(
        { success: false, error: "Squad name and tactical tag are required." },
        { status: 400 }
      );
    }

    // Check if team name or tag already taken
    const existing = await Team.findOne({
      $or: [
        { name: { $regex: `^${name.trim()}$`, $options: "i" } },
        { tag: tag.trim().toUpperCase() },
      ],
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A squad with this name or tag already exists." },
        { status: 409 }
      );
    }

    // Check if user already captains a squad
    const captainExisting = await Team.findOne({ captain: auth.userId });
    if (captainExisting) {
      return NextResponse.json(
        {
          success: false,
          error: `You already captain squad "${captainExisting.name}". Leave or transfer leadership first.`,
        },
        { status: 400 }
      );
    }

    // Fetch user's game profile if not provided
    const userDoc = await User.findById(auth.userId);
    const gameProfile = userDoc?.gameProfiles?.find((p: any) => p.game === (game || "bgmi"));
    const primaryGameId = captainGameId || gameProfile?.gameId || "512984" + Math.floor(1000 + Math.random() * 9000);
    const primaryIgn = captainIgn || gameProfile?.inGameName || auth.name;

    const newTeam = await Team.create({
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      game: game || "bgmi",
      logoUrl:
        logoUrl ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
      bio: bio || "Official competitive lineup on MVP Arena.",
      captain: auth.userId,
      members: [
        {
          user: auth.userId,
          gameId: primaryGameId,
          inGameName: primaryIgn,
          role: "igl",
          status: "active",
          joinedAt: new Date(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: `Squad "${newTeam.name}" [${newTeam.tag}] established successfully!`,
      data: newTeam,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
