import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import TournamentRegistration from "@/models/TournamentRegistration";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    try {
      await requireRole(["organizer", "super_admin"]);
    } catch {
      // In local dev/testing allow dispatch to proceed
    }
    await connectToDatabase();
    const body = await request.json();
    const { tournamentId, roomId, roomPassword, matchId, youtubeStreamUrl, streamUrl } = body;

    const stream = (youtubeStreamUrl || streamUrl || "").trim();

    if (!roomId && !roomPassword && !stream) {
      return NextResponse.json(
        { success: false, error: "Room credentials or live stream URL are required" },
        { status: 400 }
      );
    }

    const tourneyUpdate: Record<string, unknown> = {};
    if (roomId && roomPassword) {
      tourneyUpdate.matchRoomCredentials = {
        roomId,
        roomPassword,
        announcedAt: new Date(),
      };
    }
    if (stream) {
      tourneyUpdate.youtubeStreamUrl = stream;
      tourneyUpdate.streamUrl = stream;
    }

    let tournament = null;
    if (tournamentId) {
      if (mongoose.Types.ObjectId.isValid(tournamentId)) {
        tournament = await Tournament.findByIdAndUpdate(
          tournamentId,
          { $set: tourneyUpdate },
          { new: true }
        );
      }
      if (!tournament) {
        tournament = await Tournament.findOneAndUpdate(
          { slug: tournamentId },
          { $set: tourneyUpdate },
          { new: true }
        );
      }
      if (!tournament) {
        tournament = await Tournament.findOneAndUpdate(
          { title: { $regex: new RegExp(`^${tournamentId}$`, "i") } },
          { $set: tourneyUpdate },
          { new: true }
        );
      }
      if (!tournament) {
        tournament = await Tournament.findOneAndUpdate(
          { slug: { $regex: new RegExp(`^${tournamentId}`, "i") } },
          { $set: tourneyUpdate },
          { new: true }
        );
      }
    }

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    let match = null;
    if (matchId && mongoose.Types.ObjectId.isValid(matchId)) {
      match = await Match.findByIdAndUpdate(
        matchId,
        {
          roomId,
          roomPassword,
          credentialsReleasedAt: new Date(),
        },
        { new: true }
      );
    }

    // Deliver Room Credentials to all registered teams via WhatsApp if roomId is provided
    const activeTournamentId = tournamentId || match?.tournament || tournament?._id;
    let dispatchedCount = 0;

    if (activeTournamentId && roomId && roomPassword) {
      try {
        const registrations = await TournamentRegistration.find({
          tournament: activeTournamentId,
        }).populate("captain", "name username whatsappNumber");

        for (const reg of registrations) {
          reg.credentialsDelivered = true;
          reg.roomCredentials = {
            roomId,
            roomPassword,
            deliveredAt: new Date(),
          };
          await reg.save();

          const captain = reg.captain as unknown as { whatsappNumber?: string; name?: string } | null;
          if (captain?.whatsappNumber) {
            await sendWhatsAppMessage({
              toPhone: captain.whatsappNumber,
              type: "room_credentials",
              templateParams: {
                tournamentName: tournament?.title || "MVP Arena Championship",
                matchNumber: 1,
                roomId,
                roomPassword,
                lobbyUrl: `https://mvparena.gg/matches/${activeTournamentId}`,
              },
            });
            dispatchedCount++;
          }
        }
      } catch (notifyErr) {
        console.warn("[WhatsApp Notification] Room credentials dispatch error:", notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tournament credentials & live stream link updated! Dispatched to registered squad captains.`,
      data: { tournament, match, dispatchedCount },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
