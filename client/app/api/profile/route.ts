import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import TournamentRegistration from "@/models/TournamentRegistration";
import PlayerStat from "@/models/PlayerStat";
import { getCurrentUser } from "@/lib/auth";

// GET /api/profile - Fetch real authenticated athlete profile & stats
export async function GET() {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found" },
        { status: 404 }
      );
    }

    // Query real production tournament participations & kill records
    const tournamentsCount = await TournamentRegistration.countDocuments({
      $or: [{ user: user._id }, { captain: user._id }, { "members.user": user._id }],
    });

    const userGameIds = user.gameProfiles?.map((p) => p.gameId) || [];
    let stats = {
      tournamentsPlayed: tournamentsCount,
      matchesPlayed: tournamentsCount,
      totalEliminations: 0,
      winCount: 0,
      bestRank: tournamentsCount > 0 ? 1 : 0,
      squadMembersCount: user.friends?.length || 0,
    };

    if (userGameIds.length > 0) {
      const statsAgg = await PlayerStat.aggregate([
        { $match: { gameId: { $in: userGameIds } } },
        {
          $group: {
            _id: null,
            totalKills: { $sum: "$kills" },
            matchesPlayed: { $sum: 1 },
            wins: {
              $sum: {
                $cond: [{ $eq: ["$placement", 1] }, 1, 0],
              },
            },
            bestRank: { $min: "$placement" },
          },
        },
      ]);

      if (statsAgg.length > 0) {
        const item = statsAgg[0];
        stats = {
          tournamentsPlayed: tournamentsCount,
          matchesPlayed: item.matchesPlayed || tournamentsCount,
          totalEliminations: item.totalKills || 0,
          winCount: item.wins || 0,
          bestRank: item.bestRank || (tournamentsCount > 0 ? 1 : 0),
          squadMembersCount: user.friends?.length || 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user.toObject(),
        stats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Athlete edits their own profile (name, username, bio, whatsapp, upi, gameProfiles)
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // 1. Name update
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      user.name = body.name.trim();
    }

    // 2. Username update (enforce uniqueness)
    if (typeof body.username === "string" && body.username.trim().length >= 3) {
      const cleanUsername = body.username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
      if (cleanUsername !== user.username) {
        const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (existing) {
          return NextResponse.json(
            { success: false, error: "Username is already claimed by another athlete." },
            { status: 409 }
          );
        }
        user.username = cleanUsername;
      }
    }

    // 3. Bio update
    if (typeof body.bio === "string") {
      user.bio = body.bio.trim().slice(0, 250);
    }

    // 4. WhatsApp Number
    if (typeof body.whatsappNumber === "string") {
      user.whatsappNumber = body.whatsappNumber.trim();
    }

    // 5. UPI ID
    if (typeof body.upiId === "string") {
      user.upiId = body.upiId.trim();
    }

    // 5b. Avatar URL
    if (typeof body.avatarUrl === "string" && body.avatarUrl.trim().length > 0) {
      user.avatarUrl = body.avatarUrl.trim();
    }

    // 6. Game Profile Upsert
    if (body.gameProfile && body.gameProfile.game && body.gameProfile.gameId) {
      const existingIdx = user.gameProfiles.findIndex((g: { game: string }) => g.game === body.gameProfile.game);
      const updatedProfile = {
        game: body.gameProfile.game,
        gameId: String(body.gameProfile.gameId).trim(),
        inGameName: String(body.gameProfile.inGameName || user.username).trim(),
        verified: true,
      };
      if (existingIdx >= 0) {
        user.gameProfiles[existingIdx] = updatedProfile;
      } else {
        user.gameProfiles.push(updatedProfile);
      }
    }

    await user.save();
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
