import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let match = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      match = await Match.findById(id).populate("tournament");
    }

    if (!match) {
      match = await Match.findOne().populate("tournament");
    }

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    // Verify 10-minute credential lock
    const currentUser = await getCurrentUser();
    const tourney: any = match.tournament;
    const organizerId = tourney?.organizer?.toString();
    const isOrganizerOrAdmin =
      currentUser?.role === "super_admin" ||
      (currentUser && organizerId && currentUser.userId === organizerId);

    const matchTime = tourney?.tournamentDate ? new Date(tourney.tournamentDate).getTime() : 0;
    const tenMinutesBefore = matchTime > 0 ? matchTime - 10 * 60 * 1000 : 0;
    const isWithinTenMinutes = matchTime === 0 || Date.now() >= tenMinutesBefore;

    const matchObj: any = match.toObject ? match.toObject() : { ...match };
    if (!isOrganizerOrAdmin && !isWithinTenMinutes) {
      matchObj.roomId = "";
      matchObj.roomPassword = "";
      matchObj.credentialsLocked = true;
      matchObj.revealsAt = tenMinutesBefore > 0 ? new Date(tenMinutesBefore).toISOString() : null;
    } else {
      matchObj.credentialsLocked = false;
    }

    return NextResponse.json({ success: true, data: matchObj });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
