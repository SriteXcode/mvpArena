import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SupportInquiry from "@/models/SupportInquiry";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, category, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const inquiry = await SupportInquiry.create({
      name,
      email,
      phone: phone || "",
      category: category || "general",
      subject,
      message,
      status: "unread",
    });

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been submitted. Our esports concierge team will respond within 2 hours.",
      data: inquiry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
