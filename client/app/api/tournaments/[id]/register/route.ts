import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentRegistration from "@/models/TournamentRegistration";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// In-memory store for active registrations across dev/demo sessions
const inMemoryRegistrations = new Map<string, any>();

function generateSquadToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "SQ-";
  for (let i = 0; i < 5; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    const captainId = currentUser?.userId || "usr_guest";

    // Check memory store first for rapid demo response
    const memKey = `${captainId}_${id}`;
    if (inMemoryRegistrations.has(memKey)) {
      return NextResponse.json({
        success: true,
        data: inMemoryRegistrations.get(memKey),
      });
    }

    try {
      const conn = await connectToDatabase();
      if (conn) {
        const reg = await TournamentRegistration.findOne({
          tournament: id,
          captain: captainId,
        }).lean();

        if (reg) {
          return NextResponse.json({
            success: true,
            data: reg,
          });
        }
      }
    } catch (e) {
      console.warn("DB registration check fallback:", e);
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "No active registration for this tournament.",
    });
  } catch (error) {
    console.error("Fetch registration error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching registration status." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      teamName,
      format = "squad",
      captainGameId,
      captainInGameName,
      invitedMembers = [],
      matchStartTime,
      razorpayPaymentId,
    } = body;

    if (!teamName || !teamName.trim()) {
      return NextResponse.json(
        { success: false, message: "Team Name is required." },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const captainId = currentUser?.userId || "usr_guest";
    const captainName = currentUser?.name || captainInGameName || "Team Captain";

    const squadToken = generateSquadToken();
    const maxMembers = format === "solo" ? 1 : format === "duo" ? 2 : 4;

    // Calculate Roster Lock: 10 minutes before match kickoff
    const matchDate = matchStartTime ? new Date(matchStartTime) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    const rosterLockedAt = new Date(matchDate.getTime() - 10 * 60 * 1000);

    // Initial squad roster: Captain is slot 1
    const members = [
      {
        gameId: captainGameId || "5129847291",
        inGameName: captainInGameName || captainName,
        role: "captain",
        status: "confirmed",
        joinedAt: new Date().toISOString(),
      },
    ];

    // Append invited teammates
    if (Array.isArray(invitedMembers)) {
      invitedMembers.slice(0, maxMembers - 1).forEach((im: any) => {
        members.push({
          gameId: im.gameId,
          inGameName: im.inGameName || "Teammate",
          role: "member",
          status: im.status || "invited_pending",
          joinedAt: new Date().toISOString(),
        });
      });
    }

    const registrationRecord = {
      id: `reg_${Date.now()}`,
      tournamentId: id,
      teamName: teamName.trim(),
      format,
      captainId,
      captainName,
      squadToken,
      members,
      maxMembers,
      isEarlyLocked: true,
      matchStartTime: matchDate.toISOString(),
      rosterLockedAt: rosterLockedAt.toISOString(),
      paymentStatus: razorpayPaymentId ? "completed" : "free",
      paymentId: razorpayPaymentId || undefined,
      credentialsDelivered: false,
      roomCredentials: {
        roomId: "882910",
        roomPassword: "play99",
      },
      createdAt: new Date().toISOString(),
    };

    // Save to in-memory store
    const memKey = `${captainId}_${id}`;
    inMemoryRegistrations.set(memKey, registrationRecord);

    // Also persist in global token lookup for teammates joining
    inMemoryRegistrations.set(`token_${squadToken}`, registrationRecord);

    // Try MongoDB
    try {
      const conn = await connectToDatabase();
      if (conn) {
        await TournamentRegistration.create({
          tournament: id,
          teamName: teamName.trim(),
          format,
          captain: captainId,
          squadToken,
          members: members.map((m) => ({
            gameId: m.gameId,
            inGameName: m.inGameName,
            role: (m.role || "member") as "captain" | "member" | "substitute",
            status: (m.status || "confirmed") as "confirmed" | "invited_pending",
            joinedAt: new Date(m.joinedAt),
          })),
          maxMembers,
          isEarlyLocked: true,
          rosterLockedAt,
          paymentStatus: razorpayPaymentId ? "completed" : "free",
          paymentId: razorpayPaymentId || undefined,
          credentialsDelivered: false,
          roomCredentials: {
            roomId: "882910",
            roomPassword: "play99",
          },
        });

        // Increment registered slots on tournament document
        await Tournament.findByIdAndUpdate(id, {
          $inc: { registeredSlots: 1 },
        });

        // Dispatch WhatsApp tournament confirmation message
        try {
          const captainUser = await User.findById(captainId);
          const tournamentDoc = await Tournament.findById(id);
          const targetPhone = captainUser?.whatsappNumber || body.whatsappNumber;

          if (targetPhone) {
            await sendWhatsAppMessage({
              toPhone: targetPhone,
              type: "registration_confirmed",
              templateParams: {
                playerName: captainName,
                teamName: teamName.trim(),
                tournamentName: tournamentDoc?.title || "MVP Arena Scrims",
                gameTitle: tournamentDoc?.game || "bgmi",
                squadToken,
                matchStartTime: matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            });
          }
        } catch (waErr) {
          console.warn("[WhatsApp Notification] Registration dispatch skipped:", waErr);
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB registration save fallback:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Tournament roster registration completed and slot locked successfully!",
      data: registrationRecord,
    });
  } catch (error) {
    console.error("Tournament registration error:", error);
    return NextResponse.json(
      { success: false, message: "Error processing tournament registration." },
      { status: 500 }
    );
  }
}
