import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Organizer from "@/models/Organizer";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("game");
    const fee = searchParams.get("fee");
    const visibility = searchParams.get("visibility"); // "all" | "public" | "private"
    const privateToken = searchParams.get("privateToken");

    const query: Record<string, unknown> = {};
    if (game && game !== "all") query.game = game;
    if (fee === "free") query.entryFee = 0;
    if (fee === "paid") query.entryFee = { $gt: 0 };

    if (privateToken) {
      query.privateToken = privateToken;
    } else if (visibility === "private") {
      query.visibility = "private";
    } else if (visibility !== "all") {
      // By default for public marketplace, show only public tournaments
      query.visibility = { $ne: "private" };
    }

    const tournaments = await Tournament.find(query)
      .populate("organizer", "orgName logoUrl status upiId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tournaments });
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

    // Find first approved organizer or fallback
    let organizer = await Organizer.findOne({ status: "approved" });
    if (!organizer) {
      organizer = await Organizer.findOne();
    }

    const slug = (body.title || "tournament")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

    const isPrivate = body.visibility === "private";
    const generatedPrivateToken = isPrivate
      ? (body.privateToken || `PVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
      : undefined;

    const newTournament = await Tournament.create({
      title: body.title,
      slug,
      game: body.game || "bgmi",
      format: body.format || "squad",
      organizer: organizer?._id,
      bannerUrl: body.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      description: body.description || "Official tournament hosted on PlayArena",
      entryFee: Number(body.entryFee) || 0,
      prizePool: Number(body.prizePool) || 10000,
      maxSlots: Number(body.maxSlots) || 25,
      registeredSlots: 0,
      registrationStart: new Date(),
      registrationEnd: new Date(Date.now() + 86400000),
      tournamentDate: body.eventDate ? new Date(body.eventDate) : new Date(Date.now() + 172800000),
      status: "registration_open",
      visibility: isPrivate ? "private" : "public",
      privateToken: generatedPrivateToken,
      commissionRateSnapshot: organizer?.commissionRate || 10.0,
      scoringRules: {
        placementPoints: {
          "1": Number(body.firstPlacePoints) || 15,
          "2": 12,
          "3": 10,
          "4": 8,
          "5": 6,
        },
        eliminationPoints: Number(body.killPoints) || 1.0,
      },
      matchRoomCredentials: {
        roomId: body.roomId || "",
        roomPassword: body.roomPassword || "",
        announcedAt: body.roomId ? new Date() : undefined,
      },
      rules: body.rules || "Standard esports competitive guidelines apply. Emulators prohibited.",
    });

    return NextResponse.json({ success: true, data: newTournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
