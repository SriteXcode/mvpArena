import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let tournament = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tournament = await Tournament.findById(id).populate("organizer", "orgName logoUrl");
    }

    if (!tournament) {
      tournament = await Tournament.findOne({ slug: id }).populate("organizer", "orgName logoUrl");
    }

    if (!tournament) {
      // Fallback to first tournament if id is mock id
      tournament = await Tournament.findOne().populate("organizer", "orgName logoUrl");
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
