import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Organizer from "@/models/Organizer";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import ResultSubmission from "@/models/ResultSubmission";
import PayoutTransaction from "@/models/PayoutTransaction";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole(["organizer", "super_admin"]);
    await connectToDatabase();

    // Find primary organizer or create a minimal clean one if completely fresh
    let organizer = await Organizer.findOne();
    if (!organizer) {
      organizer = await Organizer.create({
        user: "673f00000000000000000001",
        orgName: "Nova Esports Hub",
        contactEmail: "nova.esports@arena.gg",
        contactPhone: "+91 98765 43210",
        status: "approved",
        commissionRate: 10.0,
        upiId: "nova.esports@okhdfcbank",
        walletBalance: 0,
        totalSettledPayouts: 0,
      });
    }

    // Fetch real tournaments
    const tournaments = await Tournament.find({
      $or: [{ organizer: organizer._id }, { organizer: { $exists: true } }],
    }).sort({ createdAt: -1 });

    // Fetch matches
    const matches = await Match.find().sort({ scheduledAt: 1 });

    // Fetch results submissions
    const results = await ResultSubmission.find().sort({ createdAt: -1 });

    // Fetch payout transactions
    const payouts = await PayoutTransaction.find({
      recipientType: "organizer",
      recipientId: organizer._id.toString(),
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        organizer: {
          _id: organizer._id,
          orgName: organizer.orgName,
          contactEmail: organizer.contactEmail,
          contactPhone: organizer.contactPhone || "",
          status: organizer.status,
          commissionRate: organizer.commissionRate || 10.0,
          upiId: organizer.upiId || "",
          walletBalance: organizer.walletBalance || 0,
          totalSettledPayouts: organizer.totalSettledPayouts || 0,
        },
        tournaments: tournaments || [],
        matches: matches || [],
        results: results || [],
        payouts: payouts || [],
      },
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
    const { orgName, contactPhone, contactEmail, upiId, organizerId } = body;

    let targetOrg;
    if (organizerId) {
      targetOrg = await Organizer.findById(organizerId);
    } else {
      targetOrg = await Organizer.findOne();
    }

    if (!targetOrg) {
      return NextResponse.json(
        { success: false, error: "Organizer profile not found" },
        { status: 404 }
      );
    }

    if (orgName) targetOrg.orgName = orgName;
    if (contactPhone) targetOrg.contactPhone = contactPhone;
    if (contactEmail) targetOrg.contactEmail = contactEmail;
    if (upiId) targetOrg.upiId = upiId;

    await targetOrg.save();

    return NextResponse.json({
      success: true,
      data: targetOrg,
      message: "Organizer profile & UPI ID updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
