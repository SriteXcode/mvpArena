import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GameInvite from "@/models/GameInvite";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET() {
  try {
    await connectToDatabase();
    const invites = await GameInvite.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invites });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const sender = await User.findOne({ username: "viper_esports" });
    const tournament = await Tournament.findOne();

    const invite = await GameInvite.create({
      sender: sender?._id,
      targetGameId: body.targetGameId,
      game: body.game || "bgmi",
      tournament: tournament?._id,
      teamName: body.teamName || "Team SoulFire",
      message: body.message || "Join our tournament squad on PlayArena!",
      status: "pending",
    });

    // Send WhatsApp notification if recipient phone is provided or sender has WhatsApp enabled
    if (sender?.whatsappNumber) {
      await sendWhatsAppMessage({
        toPhone: sender.whatsappNumber,
        type: "game_invite",
        templateParams: {
          playerName: sender.name,
          tournamentName: tournament?.title || "BGMI Pro Scrims",
          inviteUrl: `https://playarena.gg/social?invite=${invite._id}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: invite });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { inviteId, status } = body;

    const updated = await GameInvite.findByIdAndUpdate(
      inviteId,
      { status },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
