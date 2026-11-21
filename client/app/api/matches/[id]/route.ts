import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let match = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      match = await Match.findById(id).populate("tournament");
    }

    if (!match) {
      match = await Match.findOne().populate("tournament");
    }

    return NextResponse.json({ success: true, data: match });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
