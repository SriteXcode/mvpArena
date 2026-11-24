import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentRegistration from "@/models/TournamentRegistration";
import User from "@/models/User";
import Notification from "@/models/Notification";
import GameInvite from "@/models/GameInvite";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required to respond to invitation." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { registrationId, action, gameId, inGameName } = body;

    if (!action || !["accept", "reject", "decline"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid action ('accept' or 'reject') is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query registration
    let regQuery: any = { tournament: id };
    if (registrationId && mongoose.Types.ObjectId.isValid(registrationId)) {
      regQuery._id = registrationId;
    } else {
      regQuery.$or = [
        { "members.user": currentUser.userId },
        { "members.username": currentUser.username },
      ];
    }

    const registration = await TournamentRegistration.findOne(regQuery);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Squad registration not found or invitation is no longer active." },
        { status: 404 }
      );
    }

    // Check if roster is already locked
    if (registration.rosterLockedAt && Date.now() >= new Date(registration.rosterLockedAt).getTime()) {
      return NextResponse.json(
        { success: false, message: "Roster has locked. Invitations closed 10 minutes prior to kickoff." },
        { status: 400 }
      );
    }

    const memberIndex = registration.members.findIndex((m: any) =>
      (m.user && m.user.toString() === currentUser.userId) ||
      (m.username && m.username.toLowerCase() === currentUser.username.toLowerCase())
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: "You are not listed as an invited member in this squad roster." },
        { status: 404 }
      );
    }

    const tournamentDoc = await Tournament.findById(id);
    const tournamentTitle = tournamentDoc?.title || "Tournament";

    if (action === "accept") {
      const member = registration.members[memberIndex];
      member.status = "confirmed";
      member.user = new mongoose.Types.ObjectId(currentUser.userId);
      member.username = currentUser.username;

      if (gameId && gameId.trim()) {
        member.gameId = gameId.trim();
      }
      if (inGameName && inGameName.trim()) {
        member.inGameName = inGameName.trim();
      }

      // Check if user has game profile for this game; if not, add it
      if (tournamentDoc?.game && member.gameId) {
        try {
          const userDoc = await User.findById(currentUser.userId);
          const hasProfile = userDoc?.gameProfiles?.some((gp: any) => gp.game === tournamentDoc.game);
          if (userDoc && !hasProfile) {
            userDoc.gameProfiles.push({
              game: tournamentDoc.game as "bgmi" | "freefire",
              gameId: member.gameId,
              inGameName: member.inGameName || "",
              verified: false,
            });
            await userDoc.save();
          }
        } catch (profileErr) {
          console.warn("Could not auto-add game profile:", profileErr);
        }
      }

      await registration.save();

      // Update GameInvite record if exists
      await GameInvite.updateMany(
        { receiver: currentUser.userId, tournament: id, status: "pending" },
        { $set: { status: "accepted" } }
      );

      // Notify Captain
      if (registration.captain) {
        await Notification.create({
          recipient: registration.captain,
          title: "Squad Invitation Accepted! 🎯",
          message: `@${currentUser.username} accepted your squad invitation and confirmed their slot in "${registration.teamName}"!`,
          type: "tournament_update",
          link: `/tournaments/${id}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `🎉 Successfully joined squad "${registration.teamName}"! Your slot is confirmed.`,
        data: registration,
      });
    } else {
      // action is "reject" or "decline"
      // REMOVE the member from the squad so the slot becomes EMPTY!
      registration.members.splice(memberIndex, 1);
      await registration.save();

      // Update GameInvite record if exists
      await GameInvite.updateMany(
        { receiver: currentUser.userId, tournament: id, status: "pending" },
        { $set: { status: "declined" } }
      );

      // Notify Captain that slot is open again
      if (registration.captain) {
        await Notification.create({
          recipient: registration.captain,
          title: "Squad Invitation Declined ⚠️",
          message: `@${currentUser.username} declined your invitation to join "${registration.teamName}". That slot is now empty and open for another teammate.`,
          type: "tournament_update",
          link: `/tournaments/${id}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `You declined the invitation to join squad "${registration.teamName}". The slot is now open for the captain.`,
        data: registration,
      });
    }
  } catch (error) {
    console.error("Error responding to invitation:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Failed to respond to invitation." },
      { status: 500 }
    );
  }
}
