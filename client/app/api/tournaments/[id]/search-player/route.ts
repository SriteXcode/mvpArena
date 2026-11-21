import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Known mock players for testing search by Game ID
const KNOWN_PLAYERS = [
  {
    id: "usr_jonathan",
    name: "Jonathan Amaral",
    username: "godl_jonathan",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    gameProfiles: [
      { game: "bgmi", gameId: "5918237462", inGameName: "GodL_Jonathan", verified: true },
      { game: "freefire", gameId: "7766554433", inGameName: "GodL_JonaFF", verified: true }
    ]
  },
  {
    id: "usr_mortal",
    name: "Naman Mathur",
    username: "soul_mortal",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    gameProfiles: [
      { game: "bgmi", gameId: "5129847291", inGameName: "Soul_Mortal", verified: true }
    ]
  },
  {
    id: "usr_scout",
    name: "Tanmay Singh",
    username: "scout_op",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    gameProfiles: [
      { game: "bgmi", gameId: "5112233445", inGameName: "TX_Scout", verified: true }
    ]
  },
  {
    id: "usr_pahadi",
    name: "Lokesh Karakoti",
    username: "pahadi_gaming",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100",
    gameProfiles: [
      { game: "freefire", gameId: "981726354", inGameName: "Pahadi_FF", verified: true }
    ]
  }
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // resolve params promise
    const body = await req.json();
    const { gameId, game } = body;

    if (!gameId || typeof gameId !== "string" || !gameId.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid Game ID to search." },
        { status: 400 }
      );
    }

    const cleanGameId = gameId.trim();

    // 1. Try querying MongoDB User collection
    try {
      const conn = await connectToDatabase();
      if (conn) {
        const dbUser = await User.findOne({
          "gameProfiles.gameId": cleanGameId,
        }).lean();

        if (dbUser) {
          const profile = dbUser.gameProfiles?.find(
            (p: { gameId: string; game?: string }) => p.gameId === cleanGameId
          );

          return NextResponse.json({
            success: true,
            found: true,
            user: {
              id: dbUser._id.toString(),
              name: dbUser.name,
              username: dbUser.username,
              avatarUrl: dbUser.avatarUrl || "/avatar.png",
              inGameName: profile?.inGameName || dbUser.name,
              gameId: cleanGameId,
              verified: profile?.verified ?? true,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB search fallback to known players list:", dbErr);
    }

    // 2. Check in known mock player database
    const matchedPlayer = KNOWN_PLAYERS.find((p) =>
      p.gameProfiles.some((gp) => gp.gameId === cleanGameId)
    );

    if (matchedPlayer) {
      const matchedProfile = matchedPlayer.gameProfiles.find(
        (gp) => gp.gameId === cleanGameId
      );

      return NextResponse.json({
        success: true,
        found: true,
        user: {
          id: matchedPlayer.id,
          name: matchedPlayer.name,
          username: matchedPlayer.username,
          avatarUrl: matchedPlayer.avatarUrl,
          inGameName: matchedProfile?.inGameName || matchedPlayer.name,
          gameId: cleanGameId,
          verified: matchedProfile?.verified ?? true,
        },
      });
    }

    // 3. User is NOT registered yet
    return NextResponse.json({
      success: true,
      found: false,
      searchGameId: cleanGameId,
      message: "No athlete registered with this Game ID on PlayArena yet. An invite link can be generated.",
    });
  } catch (error) {
    console.error("Player search error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during athlete lookup." },
      { status: 500 }
    );
  }
}
