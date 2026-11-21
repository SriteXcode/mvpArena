import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SupportInquiry from "@/models/SupportInquiry";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    const dbInquiries = await SupportInquiry.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: dbInquiries || [],
    });
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
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const updated = await SupportInquiry.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
