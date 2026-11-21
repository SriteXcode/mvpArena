import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ResultSubmission from "@/models/ResultSubmission";
import { recalculateTournamentLeaderboard } from "@/lib/scoring/engine";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole(["organizer", "super_admin"]);
    await connectToDatabase();
    const pending = await ResultSubmission.find({ status: "pending" })
      .populate("tournament", "title game")
      .populate("submittedBy", "name username whatsappNumber gameProfiles")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: pending });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["organizer", "super_admin"]);
    await connectToDatabase();
    const body = await request.json();
    const { submissionId, action, rejectionReason } = body;

    const submission = await ResultSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    if (action === "approve") {
      submission.status = "approved";
      submission.reviewedAt = new Date();
      await submission.save();

      // Recalculate official tournament leaderboard
      if (submission.tournament) {
        await recalculateTournamentLeaderboard(submission.tournament.toString());
      }

      // Send WhatsApp verified alert to the player
      const user = await User.findById(submission.submittedBy);
      if (user?.whatsappNumber) {
        await sendWhatsAppMessage({
          toPhone: user.whatsappNumber,
          type: "result_verified",
          templateParams: {
            tournamentName: "BGMI Pro Scrims Season 4",
            placement: submission.placement,
            eliminations: submission.eliminations,
            totalPoints: 15 + submission.eliminations, // 15 placement + kills
          },
        });
      }
    } else if (action === "reject") {
      submission.status = "rejected";
      submission.rejectionReason = rejectionReason || "Evidence does not match claimed score.";
      submission.reviewedAt = new Date();
      await submission.save();
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
