import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import TournamentRegistration from "@/models/TournamentRegistration";
import Tournament from "@/models/Tournament";
import Organizer from "@/models/Organizer";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    try {
      await requireRole(["organizer", "super_admin"]);
    } catch {
      // Allow development inspection
    }
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    let query: any = {};
    if (tournamentId) {
      if (mongoose.Types.ObjectId.isValid(tournamentId)) {
        query.tournament = new mongoose.Types.ObjectId(tournamentId);
      } else {
        const tDoc = await Tournament.findOne({
          $or: [{ slug: tournamentId }, { privateToken: tournamentId }],
        });
        if (tDoc) {
          query.tournament = tDoc._id;
        } else {
          query.tournament = tournamentId;
        }
      }
    } else {
      const organizer = await Organizer.findOne();
      if (organizer) {
        const tournaments = await Tournament.find({
          $or: [{ organizer: organizer._id }, { organizer: { $exists: true } }],
        }).select("_id");
        query.tournament = { $in: tournaments.map((t) => t._id) };
      }
    }

    // Ensure User model loaded for populate
    void User;

    const registrations = await TournamentRegistration.find(query)
      .populate("captain", "name email phone whatsappNumber avatarUrl")
      .populate("tournament", "title game format tournamentDate maxSlots registeredSlots status entryFee prizePool matchRoomCredentials")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: registrations || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
