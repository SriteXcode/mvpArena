import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Organizer from "@/models/Organizer";

export async function GET() {
  try {
    await connectToDatabase();
    const organizers = await Organizer.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: organizers });
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
    const { organizerId, commissionRate, status } = body;

    const update: Record<string, unknown> = {};
    if (commissionRate !== undefined) update.commissionRate = Number(commissionRate);
    if (status !== undefined) update.status = status;

    const updated = await Organizer.findByIdAndUpdate(organizerId, update, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
