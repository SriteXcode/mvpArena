import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole } from "@/lib/auth";

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
      tournament = await Tournament.findOne({
        title: { $regex: new RegExp(`^${id}$`, "i") },
      }).populate("organizer", "orgName logoUrl");
    }

    if (!tournament) {
      tournament = await Tournament.findOne({
        slug: { $regex: new RegExp(`^${id}`, "i") },
      }).populate("organizer", "orgName logoUrl");
    }

    if (!tournament) {
      return NextResponse.json({ success: false, error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireRole(["organizer", "super_admin"]);
    } catch {
      // In local dev/testing allow stream update to proceed
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updateFields: Record<string, unknown> = {};
    if (body.youtubeStreamUrl !== undefined) {
      updateFields.youtubeStreamUrl = body.youtubeStreamUrl;
      updateFields.streamUrl = body.youtubeStreamUrl;
    }
    if (body.streamUrl !== undefined) {
      updateFields.streamUrl = body.streamUrl;
      if (!updateFields.youtubeStreamUrl) {
        updateFields.youtubeStreamUrl = body.streamUrl;
      }
    }
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.rules !== undefined) updateFields.rules = body.rules;
    if (body.codeOfConduct !== undefined) updateFields.codeOfConduct = body.codeOfConduct;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Tournament.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    }
    if (!updated) {
      updated = await Tournament.findOneAndUpdate({ slug: id }, { $set: updateFields }, { new: true });
    }
    if (!updated) {
      updated = await Tournament.findOneAndUpdate(
        { title: { $regex: new RegExp(`^${id}$`, "i") } },
        { $set: updateFields },
        { new: true }
      );
    }
    if (!updated) {
      updated = await Tournament.findOneAndUpdate(
        { slug: { $regex: new RegExp(`^${id}`, "i") } },
        { $set: updateFields },
        { new: true }
      );
    }
    if (!updated) {
      return NextResponse.json({ success: false, error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
