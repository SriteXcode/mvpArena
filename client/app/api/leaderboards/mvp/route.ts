import { NextRequest, NextResponse } from "next/server";
import { PipelineStage } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import PlayerStat from "@/models/PlayerStat";

// GET /api/leaderboards/mvp?game=all|bgmi|freefire&timeframe=daily|monthly|global
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") || "all";
    const timeframe = searchParams.get("timeframe") || "global";

    const matchFilter: Record<string, unknown> = {};

    // Game filter
    if (game && game !== "all") {
      matchFilter.game = game;
    }

    // Timeframe filter
    const now = new Date();
    if (timeframe === "daily") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      matchFilter.matchDate = { $gte: startOfDay };
    } else if (timeframe === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      matchFilter.matchDate = { $gte: startOfMonth };
    }

    // Aggregation pipeline to group player kills and rank
    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: "$gameId",
          gameId: { $first: "$gameId" },
          inGameName: { $first: "$inGameName" },
          teamName: { $first: "$teamName" },
          game: { $first: "$game" },
          totalKills: { $sum: "$kills" },
          matchesPlayed: { $sum: 1 },
          bestPlacement: { $min: "$placement" },
          avgKills: { $avg: "$kills" },
        },
      },
      {
        $sort: {
          totalKills: -1,
          avgKills: -1,
          matchesPlayed: -1,
        },
      },
      { $limit: 50 },
    ];

    interface AggregatedMvpStat {
      gameId: string;
      inGameName?: string;
      teamName?: string;
      game?: "bgmi" | "freefire";
      totalKills?: number;
      matchesPlayed?: number;
      bestPlacement?: number;
      avgKills?: number;
    }

    const results = (await PlayerStat.aggregate(pipeline)) as AggregatedMvpStat[];

    // Format rankings with rank index and podium data
    const formatted = results.map((item: AggregatedMvpStat, idx: number) => ({
      rank: idx + 1,
      gameId: item.gameId,
      inGameName: item.inGameName || `Athlete_${item.gameId.slice(-4)}`,
      teamName: item.teamName || "Independent",
      game: item.game || "bgmi",
      totalKills: item.totalKills || 0,
      matchesPlayed: item.matchesPlayed || 1,
      bestPlacement: item.bestPlacement || 1,
      avgKills: Number(item.avgKills?.toFixed(1)) || 0,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.inGameName || item.gameId)}`,
      badge: idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : undefined,
    }));

    const topThree = formatted.slice(0, 3);

    return NextResponse.json({
      success: true,
      timeframe,
      game,
      data: {
        topThree,
        rankings: formatted,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
