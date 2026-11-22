import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import TournamentRegistration from "@/models/TournamentRegistration";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: true, hasPendingInvite: false, isConfirmed: false });
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
      return NextResponse.json({ success: true, hasPendingInvite: false, isConfirmed: false });
    }

    const reg = await TournamentRegistration.findOne({
      tournament: id,
      $or: queryOr,
    }).populate("captain", "name username avatarUrl").lean();

    if (!reg) {
      return NextResponse.json({ success: true, hasPendingInvite: false, isConfirmed: false });
    }

    const member = (reg.members || []).find(
      (m: any) =>
        (m.user && m.user.toString() === currentUser.userId) ||
        (m.username && m.username.toLowerCase() === currentUser.username.toLowerCase())
    );

    if (!member) {
      return NextResponse.json({ success: true, hasPendingInvite: false, isConfirmed: false });
    }

    const captainDoc = reg.captain as any;
    const isPending = member.status === "invited_pending" || member.status === "waiting_for_login";
    const isConfirmed = member.status === "confirmed";

    return NextResponse.json({
      success: true,
      hasPendingInvite: isPending,
      isConfirmed,
      registration: {
        id: (reg as any)._id?.toString() || "",
        teamName: reg.teamName,
        format: reg.format,
        squadToken: reg.squadToken,
        captainName: captainDoc?.name || captainDoc?.username || "Team Captain",
        captainUsername: captainDoc?.username || "",
        member,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
