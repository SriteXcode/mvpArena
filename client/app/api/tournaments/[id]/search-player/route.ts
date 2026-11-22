import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Known mock players for testing search by Username or Game ID
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
    const { query, searchType = "all", gameId, username, game } = body;

    const rawQuery = (query || username || gameId || "").trim();
    if (!rawQuery) {
      return NextResponse.json(
        { success: false, message: "Please enter a username or Game ID to search." },
        { status: 400 }
      );
    }

    // Strip leading @ if user typed @username
    const cleanQuery = rawQuery.replace(/^@/, "").trim();
    const isPureDigits = /^\d+$/.test(cleanQuery);

    // Escape regex special characters to prevent regex crashes
    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. Try querying MongoDB User collection (with strict public projection)
    try {
      const conn = await connectToDatabase();
      if (conn) {
        let dbQuery: Record<string, unknown> = {};

        if (searchType === "username") {
          dbQuery = {
            $or: [
              { username: { $regex: escapedQuery, $options: "i" } },
              { name: { $regex: escapedQuery, $options: "i" } },
            ],
          };
        } else if (searchType === "gameId") {
          dbQuery = {
            $or: [
              { "gameProfiles.gameId": cleanQuery },
              { "gameProfiles.inGameName": { $regex: escapedQuery, $options: "i" } },
            ],
          };
        } else {
          // "all" - search username, name, gameId, or inGameName
          dbQuery = {
            $or: [
              { username: { $regex: escapedQuery, $options: "i" } },
              { name: { $regex: escapedQuery, $options: "i" } },
              { "gameProfiles.gameId": cleanQuery },
              { "gameProfiles.inGameName": { $regex: escapedQuery, $options: "i" } },
            ],
          };
        }

        // STRICT PUBLIC DATA PROJECTION: Never select email, phone, upi, wallet, password
        const dbUsers = await User.find(dbQuery)
          .select("name username avatarUrl bio gameProfiles role createdAt")
          .limit(5)
          .lean();

        if (dbUsers && dbUsers.length > 0) {
          // Pick exact match first, or first match
          const exactUser =
            dbUsers.find(
              (u) =>
                u.username.toLowerCase() === cleanQuery.toLowerCase() ||
                u.gameProfiles?.some((p: any) => p.gameId === cleanQuery)
            ) || dbUsers[0];

          // Match profile for requested game
          const matchingProfile =
            exactUser.gameProfiles?.find(
              (p: { gameId: string; game?: string; inGameName?: string }) =>
                (game && p.game === game) ||
                p.gameId === cleanQuery ||
                p.inGameName?.toLowerCase() === cleanQuery.toLowerCase()
            ) ||
            exactUser.gameProfiles?.find((p: any) => !game || p.game === game) ||
            null;

          return NextResponse.json({
            success: true,
            found: true,
            user: {
              id: exactUser._id.toString(),
              name: exactUser.name,
              username: exactUser.username,
              avatarUrl: exactUser.avatarUrl || "/avatar.png",
              bio: exactUser.bio || "",
              // USERNAME IS INDEPENDENT: Never assign username or name to inGameName or gameId!
              inGameName: matchingProfile?.inGameName || "",
              gameId: matchingProfile?.gameId || "",
              game: matchingProfile?.game || game || "bgmi",
              hasGameProfile: Boolean(matchingProfile?.gameId),
              verified: matchingProfile?.verified ?? false,
              isRegistered: true,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB search fallback to known players list:", dbErr);
    }

    // 2. Check in known mock player database
    const matchedPlayer = KNOWN_PLAYERS.find((p) => {
      const matchUsername = p.username.toLowerCase().includes(cleanQuery.toLowerCase()) ||
                            p.name.toLowerCase().includes(cleanQuery.toLowerCase());
      const matchGameId = p.gameProfiles.some((gp) => gp.gameId === cleanQuery);
      const matchIgn = p.gameProfiles.some(
        (gp) => gp.inGameName.toLowerCase().includes(cleanQuery.toLowerCase())
      );

      if (searchType === "username") return matchUsername;
      if (searchType === "gameId") return matchGameId || matchIgn;
      return matchUsername || matchGameId || matchIgn;
    });

    if (matchedPlayer) {
      const matchedProfile =
        matchedPlayer.gameProfiles.find(
          (gp) => (game && gp.game === game) || gp.gameId === cleanQuery
        ) || matchedPlayer.gameProfiles[0];

      return NextResponse.json({
        success: true,
        found: true,
        user: {
          id: matchedPlayer.id,
          name: matchedPlayer.name,
          username: matchedPlayer.username,
          avatarUrl: matchedPlayer.avatarUrl,
          inGameName: matchedProfile?.inGameName || "",
          gameId: matchedProfile?.gameId || "",
          game: matchedProfile?.game || game || "bgmi",
          hasGameProfile: Boolean(matchedProfile?.gameId),
          verified: matchedProfile?.verified ?? true,
          isRegistered: true,
        },
      });
    }

    // 3. User is NOT registered yet
    return NextResponse.json({
      success: true,
      found: false,
      searchQuery: cleanQuery,
      searchType,
      isNumericId: isPureDigits,
      message: `No athlete registered with "${cleanQuery}" on PlayArena yet. An invite link can be generated.`,
    });
  } catch (error) {
    console.error("Player search error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during athlete lookup." },
      { status: 500 }
    );
  }
}
