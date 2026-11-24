import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TournamentRegistration from "@/models/TournamentRegistration";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ success: true, data: [] });
    }

    const queryConditions: any[] = [
      { user: auth.userId },
      { captain: auth.userId },
      { "members": { $elemMatch: { user: auth.userId, status: "confirmed" } } },
    ];
    if (auth.username) {
      queryConditions.push({
        "members": { $elemMatch: { username: auth.username, status: "confirmed" } },
      });
    }

    const registrations = await TournamentRegistration.find({
      $or: queryConditions,
    })
      .populate("tournament", "title game format prizePool bannerUrl tournamentDate status matchRoomCredentials")
      .sort({ createdAt: -1 })
      .limit(10);

    interface PopulatedTournamentDoc {
      _id: { toString(): string };
      title?: string;
      game?: "bgmi" | "freefire";
      format?: string;
      prizePool?: number;
      tournamentDate?: string;
      matchRoomCredentials?: { roomId?: string };
    }

    const formatted = registrations.map((reg, idx) => {
      const tour = reg.tournament as unknown as PopulatedTournamentDoc | null;
      const matchTime = tour?.tournamentDate ? new Date(tour.tournamentDate).getTime() : 0;
      const tenMinutesBefore = matchTime > 0 ? matchTime - 10 * 60 * 1000 : 0;
      const isWithinTenMinutes = matchTime === 0 || Date.now() >= tenMinutesBefore;
      const hasCredentials = Boolean(reg.credentialsDelivered || tour?.matchRoomCredentials?.roomId);

      return {
        id: reg._id.toString(),
        tournamentId: tour?._id?.toString() || "",
        title: tour?.title || "MVP Tournament",
        game: tour?.game || "bgmi",
        format: tour?.format || "squad",
        teamName: reg.teamName || "My Squad",
        assignedSlot: idx + 1,
        scheduledTime: tour?.tournamentDate || "Upcoming",
        startsInText: isWithinTenMinutes && hasCredentials ? "LOBBY READY" : (isWithinTenMinutes ? "STARTING SOON" : "CONFIRMED"),
        isNearest: true,
        credentialsAvailable: Boolean(isWithinTenMinutes && hasCredentials),
        matchLobbyUrl: `/matches/${tour?._id?.toString() || ""}`,
        tournamentUrl: `/tournaments/${tour?._id?.toString() || ""}`,
        prizePool: tour?.prizePool ? `₹${tour.prizePool.toLocaleString()}` : "₹5,000",
        mapName: "Erangel",
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
