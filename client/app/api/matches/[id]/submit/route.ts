import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ResultSubmission from "@/models/ResultSubmission";
import User from "@/models/User";
import Match from "@/models/Match";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const user = await User.findOne({ username: "viper_esports" });
    const match = await Match.findById(id).catch(() => null) || await Match.findOne();

    const submission = await ResultSubmission.create({
      match: match?._id,
      tournament: match?.tournament,
      teamName: body.teamName || "Team SoulFire",
      submittedBy: user?._id,
      submitterRole: "player",
      placement: Number(body.placement) || 1,
      eliminations: Number(body.eliminations) || 0,
      evidenceUrl: body.evidenceUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
      notes: body.notes || "End-game summary screenshot uploaded via Cloudinary.",
      status: "pending",
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
