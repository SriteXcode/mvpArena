import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import TournamentRegistration from "@/models/TournamentRegistration";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const queryOr: any[] = [];
    if (currentUser.userId && mongoose.Types.ObjectId.isValid(currentUser.userId)) {
      queryOr.push({ "members.user": currentUser.userId });
    }
    if (currentUser.username) {
      queryOr.push({ "members.username": currentUser.username });
    }

    if (queryOr.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const registrations = await TournamentRegistration.find({
      $or: queryOr,
      "members.status": "invited_pending",
    })
      .populate("tournament", "title game format prizePool bannerUrl tournamentDate status")
      .populate("captain", "name username avatarUrl")
      .sort({ createdAt: -1 });

    const invitations = registrations.map((r: any) => {
      const tour = r.tournament;
      const cap = r.captain;
      const mem = r.members?.find((m: any) =>
        (m.user && m.user.toString() === currentUser.userId) ||
        (m.username && m.username.toLowerCase() === currentUser.username.toLowerCase())
      );

      return {
        id: r._id.toString(),
        tournamentId: tour?._id?.toString() || "",
        tournamentTitle: tour?.title || "MVP Tournament",
        game: tour?.game || "bgmi",
        format: tour?.format || "squad",
        teamName: r.teamName,
        squadToken: r.squadToken,
        captainName: cap?.name || cap?.username || "Team Captain",
        captainUsername: cap?.username || "",
        scheduledTime: tour?.tournamentDate || "Upcoming",
        bannerUrl: tour?.bannerUrl || "",
        prizePool: tour?.prizePool ? `₹${tour.prizePool.toLocaleString()}` : "₹5,000",
        member: mem,
      };
    });

    return NextResponse.json({ success: true, data: invitations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
