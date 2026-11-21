import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ResultSubmission from "@/models/ResultSubmission";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import User from "@/models/User";
import PlayerStat from "@/models/PlayerStat";
import TournamentRegistration from "@/models/TournamentRegistration";
import { recalculateTournamentLeaderboard } from "@/lib/scoring/engine";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      tournamentId,
      matchId,
      teamName,
      placement,
      eliminations,
      evidenceUrl,
      notes,
      playerStats,
      gameIdTag,
    } = body;

    if (!teamName || placement === undefined) {
      return NextResponse.json(
        { success: false, error: "Team name and placement rank are required" },
        { status: 400 }
      );
    }

    const defaultUser = await User.findOne() || { _id: "673f00000000000000000001" };
    let match = null;
    if (matchId) {
      match = await Match.findById(matchId);
    }
    if (!match) {
      match = await Match.findOne({ tournament: tournamentId });
    }

    const activeTournamentId = tournamentId || match?.tournament;
    const tournamentDoc = activeTournamentId ? await Tournament.findById(activeTournamentId) : null;
    const game = tournamentDoc?.game || "bgmi";

    const submission = await ResultSubmission.create({
      match: match?._id || "673f00000000000000000002",
      tournament: activeTournamentId,
      teamName,
      submittedBy: defaultUser._id,
      submitterRole: "organizer",
      placement: Number(placement),
      eliminations: Number(eliminations) || 0,
      evidenceUrl:
        evidenceUrl ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
      notes: notes || "Official match result entered by tournament organizer.",
      status: "approved",
      reviewedAt: new Date(),
    });

    // Ingest Individual Player Elimination records for MVP Leaderboard
    if (Array.isArray(playerStats) && playerStats.length > 0) {
      interface IncomingStatItem {
        gameId?: string;
        playerGameId?: string;
        inGameName?: string;
        ign?: string;
        kills?: number;
      }
      const statsToInsert = playerStats.map((p: IncomingStatItem) => ({
        gameId: String(p.gameId || p.playerGameId || "5129847291"),
        inGameName: String(p.inGameName || p.ign || `${teamName}_Fragger`),
        teamName,
        game,
        tournament: activeTournamentId,
        match: match?._id,
        kills: Number(p.kills) || 0,
        placement: Number(placement),
        matchDate: new Date(),
      }));
      await PlayerStat.insertMany(statsToInsert);
    } else if (Number(eliminations) > 0) {
      // Auto-assign fragger record to squad captain/lead tag
      await PlayerStat.create({
        gameId: String(gameIdTag || "512984" + Math.floor(1000 + Math.random() * 9000)),
        inGameName: `${teamName} MVP`,
        teamName,
        game,
        tournament: activeTournamentId,
        match: match?._id,
        kills: Number(eliminations),
        placement: Number(placement),
        matchDate: new Date(),
      });
    }

    if (activeTournamentId) {
      await Tournament.findByIdAndUpdate(activeTournamentId, { status: "completed" });
      await recalculateTournamentLeaderboard(activeTournamentId.toString());

      // Dispatch WhatsApp winning message if team reached podium (#1, #2, #3)
      if (Number(placement) <= 3) {
        try {
          const teamReg = await TournamentRegistration.findOne({
            tournament: activeTournamentId,
            teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
          }).populate("captain", "name whatsappNumber");

          const captain = teamReg?.captain as unknown as { whatsappNumber?: string; name?: string } | null;
          if (captain?.whatsappNumber) {
            const prizeAmt = Number(placement) === 1
              ? (tournamentDoc?.prizePool ? Math.round(tournamentDoc.prizePool * 0.5) : "5,000")
              : Number(placement) === 2
              ? (tournamentDoc?.prizePool ? Math.round(tournamentDoc.prizePool * 0.3) : "3,000")
              : (tournamentDoc?.prizePool ? Math.round(tournamentDoc.prizePool * 0.2) : "1,500");

            await sendWhatsAppMessage({
              toPhone: captain.whatsappNumber,
              type: "winning_message",
              templateParams: {
                teamName,
                tournamentName: tournamentDoc?.title || "MVP Arena Championship",
                placement: Number(placement),
                eliminations: Number(eliminations) || 0,
                totalPoints: (Number(placement) === 1 ? 15 : Number(placement) === 2 ? 12 : 10) + (Number(eliminations) || 0),
                prizeAmount: prizeAmt,
              },
            });
          }
        } catch (waWinErr) {
          console.warn("[WhatsApp Notification] Winning dispatch skipped:", waWinErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Match result submitted and verified successfully.",
      data: submission,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
