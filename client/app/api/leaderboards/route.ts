import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import LeaderboardEntry from "@/models/LeaderboardEntry";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const game = searchParams.get("game");

    const query: Record<string, unknown> = {};
    if (tournamentId && tournamentId !== "all") {
      query.tournament = tournamentId;
    }

    const entries = await LeaderboardEntry.find(query)
      .populate("tournament", "title game")
      .sort({ totalPoints: -1 });

    interface PopulatedEntry {
      _id: unknown;
      rank?: number;
      teamName: string;
      gameIdTag?: string;
      placement?: number;
      placementPoints?: number;
      eliminationPoints?: number;
      totalPoints?: number;
      tournament?: { title?: string; game?: string };
    }

    const filtered = (entries as unknown as PopulatedEntry[]).filter((e) => {
      if (!game || game === "all") return true;
      return e.tournament?.game === game;
    });

    const mapped = filtered.map((item, idx: number) => ({
      _id: item._id,
      rank: item.rank || idx + 1,
      teamName: item.teamName,
      gameIdTag: item.gameIdTag || "Captain",
      game: item.tournament?.game || "bgmi",
      tournamentTitle: item.tournament?.title || "Season Scrims",
      placement: item.placement || 1,
      placementPoints: item.placementPoints || 0,
      eliminationPoints: item.eliminationPoints || 0,
      totalPoints: item.totalPoints || 0,
      matchesPlayed: 1,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
