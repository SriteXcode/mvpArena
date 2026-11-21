import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// GET /api/admin/campaigns - List past campaign dispatches and subscriber metrics
export async function GET() {
  try {
    await requireRole(["super_admin"]);
    await connectToDatabase();

    const campaigns = await Campaign.find()
      .populate("sentBy", "name username email")
      .sort({ sentAt: -1 })
      .limit(30);

    const totalUsers = await User.countDocuments();
    const playerUsers = await User.countDocuments({ role: "player" });
    const organizerUsers = await User.countDocuments({ role: "organizer" });

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        audienceMetrics: {
          total: totalUsers,
          players: playerUsers,
          organizers: organizerUsers,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/admin/campaigns - Compose and broadcast an institutional email campaign
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["super_admin"]);
    await connectToDatabase();

    const body = await req.json();
    const { title, subject, content, targetAudience = "all", ctaText, ctaUrl } = body;

    if (!title || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Campaign title, subject, and message content are required." },
        { status: 400 }
      );
    }

    // Query recipient emails based on target audience
    const userQuery: Record<string, unknown> = {};
    if (targetAudience === "players") {
      userQuery.role = "player";
    } else if (targetAudience === "organizers") {
      userQuery.role = "organizer";
    }

    const recipients = await User.find(userQuery).select("email name");
    const recipientEmails = recipients
      .map((u: { email?: string }) => u.email)
      .filter((e?: string): e is string => Boolean(e) && Boolean(e?.includes("@")));

    // Fallback if db is completely empty
    const finalRecipients = recipientEmails.length > 0 ? recipientEmails : ["athletes@mvparena.gg"];

    // Broadcast email via email service
    await sendEmail({
      to: finalRecipients,
      subject,
      type: "campaign",
      templateParams: {
        campaignTitle: title,
        campaignBody: content,
        ctaText: ctaText || "Join Tournament",
        ctaUrl: ctaUrl || "https://mvparena.gg/tournaments",
      },
    });

    // Record campaign history
    const campaign = await Campaign.create({
      title: title.trim(),
      subject: subject.trim(),
      content,
      targetAudience,
      ctaText: ctaText || "Explore Arena",
      ctaUrl: ctaUrl || "https://mvparena.gg/tournaments",
      sentBy: auth.userId,
      recipientCount: finalRecipients.length,
      status: "sent",
      sentAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Campaign "${title}" successfully dispatched to ${finalRecipients.length} ${targetAudience} recipient(s).`,
      data: campaign,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
