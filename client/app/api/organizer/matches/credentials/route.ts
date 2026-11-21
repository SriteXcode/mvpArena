import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import TournamentRegistration from "@/models/TournamentRegistration";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireRole(["organizer", "super_admin"]);
    await connectToDatabase();
    const body = await request.json();
    const { tournamentId, roomId, roomPassword, matchId } = body;

    if (!roomId || !roomPassword) {
      return NextResponse.json(
        { success: false, error: "Room ID and Password are required" },
        { status: 400 }
      );
    }

    let tournament = null;
    if (tournamentId) {
      tournament = await Tournament.findByIdAndUpdate(
        tournamentId,
        {
          matchRoomCredentials: {
            roomId,
            roomPassword,
            announcedAt: new Date(),
          },
        },
        { new: true }
      );
    }

    let match = null;
    if (matchId) {
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

    // Deliver Room Credentials to all registered teams via WhatsApp
    const activeTournamentId = tournamentId || match?.tournament;
    let dispatchedCount = 0;

    if (activeTournamentId) {
      try {
        const registrations = await TournamentRegistration.find({
          tournament: activeTournamentId,
        }).populate("captain", "name username whatsappNumber");

        for (const reg of registrations) {
          // Update registration credentials state
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
      message: `Room credentials issued! Instant WhatsApp dispatches delivered to ${dispatchedCount} registered squad captains.`,
      data: { tournament, match, dispatchedCount },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
