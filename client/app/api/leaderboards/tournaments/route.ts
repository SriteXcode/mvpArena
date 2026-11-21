import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

// GET /api/leaderboards/tournaments - Return distinct tournaments for Standings dropdown
export async function GET() {
  try {
    await connectToDatabase();

    const tournaments = await Tournament.find({
      visibility: { $ne: "private" },
    })
      .select("_id title game status tournamentDate")
      .sort({ createdAt: -1 })
      .limit(20);

    interface TournamentDocItem {
      _id: { toString(): string };
      title: string;
      game: string;
      status: string;
    }

    return NextResponse.json({
      success: true,
      data: (tournaments as unknown as TournamentDocItem[]).map((t) => ({
        id: t._id.toString(),
        title: t.title,
        game: t.game,
        status: t.status,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
