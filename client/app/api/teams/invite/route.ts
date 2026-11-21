import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// POST /api/teams/invite - Invite an athlete to squad by Character UID & tactical role
export async function POST(req: NextRequest) {
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
    const { gameId, inGameName, role } = body;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "10-digit Character UID is required." },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ captain: auth.userId });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Only the squad captain can issue recruitment invites." },
        { status: 403 }
      );
    }

    if (team.members.length >= 6) {
      return NextResponse.json(
        { success: false, error: "Roster is full (maximum 6 athletes including substitutes)." },
        { status: 400 }
      );
    }

    // Check if player UID is already on the roster
    const alreadyMember = team.members.find(
      (m: { gameId: string }) => m.gameId.toLowerCase() === gameId.trim().toLowerCase()
    );
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, error: "This athlete is already in your squad lineup." },
        { status: 400 }
      );
    }

    // Attempt to resolve registered user by Game UID
    const candidateUser = await User.findOne({
      "gameProfiles.gameId": gameId.trim(),
    });

    const candidateIgn =
      inGameName?.trim() ||
      candidateUser?.gameProfiles?.find((p: { gameId: string; inGameName?: string }) => p.gameId === gameId.trim())?.inGameName ||
      candidateUser?.name ||
      `Athlete_${gameId.slice(-4)}`;

    team.members.push({
      user: candidateUser?._id,
      gameId: gameId.trim(),
      inGameName: candidateIgn,
      role: role || "assaulter",
      status: "active", // Direct roster inclusion for scrims readiness
      joinedAt: new Date(),
    });

    await team.save();

    // Dispatch WhatsApp recruitment invitation if candidate has a WhatsApp number registered
    if (candidateUser?.whatsappNumber) {
      try {
        await sendWhatsAppMessage({
          toPhone: candidateUser.whatsappNumber,
          type: "game_invite",
          templateParams: {
            playerName: auth.name,
            teamName: team.name,
            tournamentName: `${team.game.toUpperCase()} Competitive Season`,
            squadToken: team.tag,
            inviteUrl: "https://mvparena.gg/social",
          },
        });
      } catch (waErr) {
        console.warn("[WhatsApp Notification] Invite dispatch error:", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${candidateIgn} [UID: ${gameId.trim()}] confirmed as ${role?.toUpperCase() || "ASSAULTER"} on ${team.name}!`,
      data: team,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/invite - Remove a member or leave squad
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberGameId = searchParams.get("gameId");

    if (!memberGameId) {
      return NextResponse.json(
        { success: false, error: "Member Game UID is required" },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findOne({
      $or: [{ captain: auth.userId }, { "members.user": auth.userId }],
    });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Squad not found" },
        { status: 404 }
      );
    }

    const isCaptain = team.captain.toString() === auth.userId;
    const isSelf = team.members.some(
      (m: { gameId: string; user?: unknown }) => m.gameId === memberGameId && m.user?.toString() === auth.userId
    );

    if (!isCaptain && !isSelf) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to remove this member." },
        { status: 403 }
      );
    }

    // Do not remove captain unless disbanding
    const target = team.members.find((m: { gameId: string; role?: string; user?: unknown }) => m.gameId === memberGameId);
    if (target?.role === "captain" || team.captain.toString() === target?.user?.toString()) {
      return NextResponse.json(
        { success: false, error: "Captain cannot be removed. Disband squad instead." },
        { status: 400 }
      );
    }

    team.members = team.members.filter((m: { gameId: string }) => m.gameId !== memberGameId);
    await team.save();

    return NextResponse.json({
      success: true,
      message: "Member removed from roster.",
      data: team,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
