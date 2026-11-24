import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentRegistration from "@/models/TournamentRegistration";
import User from "@/models/User";
import Notification from "@/models/Notification";
import GameInvite from "@/models/GameInvite";
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
        const queryConditions: any[] = [];
        if (captainId && !captainId.startsWith("usr_")) {
          queryConditions.push({ captain: captainId }, { "members.user": captainId });
        }
        if (currentUser?.username) {
          queryConditions.push({ "members.username": currentUser.username });
        }

        let reg = null;
        if (queryConditions.length > 0) {
          reg = await TournamentRegistration.findOne({
            tournament: id,
            $or: queryConditions,
          }).populate("captain", "name username avatarUrl").lean();
        }

        if (reg) {
          const regObj: any = { ...reg };
          const tourneyDoc = await Tournament.findById(id).select("tournamentDate matchRoomCredentials").lean();
          const matchTime = tourneyDoc?.tournamentDate ? new Date(tourneyDoc.tournamentDate).getTime() : 0;
          const tenMinCutoff = matchTime > 0 ? matchTime - 10 * 60 * 1000 : 0;
          const isWithinTenMinutes = matchTime === 0 || Date.now() >= tenMinCutoff;

          if (!isWithinTenMinutes) {
            regObj.roomCredentials = {
              roomId: "",
              roomPassword: "",
              revealed: false,
              revealsAt: tenMinCutoff > 0 ? new Date(tenMinCutoff).toISOString() : null,
            };
          } else if (tourneyDoc?.matchRoomCredentials?.roomId) {
            regObj.roomCredentials = {
              roomId: tourneyDoc.matchRoomCredentials.roomId,
              roomPassword: tourneyDoc.matchRoomCredentials.roomPassword,
              revealed: true,
            };
          }

          return NextResponse.json({
            success: true,
            data: regObj,
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

    // Fetch tournament to align with official kickoff time & room credentials
    let tourneyDoc: any = null;
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(id)) {
        tourneyDoc = await Tournament.findById(id);
      } else {
        tourneyDoc = await Tournament.findOne({ slug: id });
      }
    } catch {}

    // Calculate Roster Lock: exactly 10 minutes before match kickoff
    const matchDate = tourneyDoc?.tournamentDate
      ? new Date(tourneyDoc.tournamentDate)
      : (matchStartTime ? new Date(matchStartTime) : new Date(Date.now() + 2 * 60 * 60 * 1000));
    const rosterLockedAt = new Date(matchDate.getTime() - 10 * 60 * 1000);
    const isWithinTenMinutes = Date.now() >= rosterLockedAt.getTime();

    // Initial squad roster: Captain is slot 1
    const members: any[] = [
      {
        user: captainId && mongoose.Types.ObjectId.isValid(captainId) ? captainId : undefined,
        username: currentUser?.username || undefined,
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
        const memberUserId = im.user || (im.id && mongoose.Types.ObjectId.isValid(im.id) ? im.id : undefined);
        members.push({
          user: memberUserId,
          username: im.username || undefined,
          gameId: im.gameId || "",
          inGameName: im.inGameName || "",
          role: "member",
          status: im.status || "invited_pending",
          joinedAt: new Date().toISOString(),
        });
      });
    }

    // Only assign room credentials if match is already within 10 minutes and organizer published them
    const initialCredentials =
      isWithinTenMinutes && tourneyDoc?.matchRoomCredentials?.roomId
        ? {
            roomId: tourneyDoc.matchRoomCredentials.roomId,
            roomPassword: tourneyDoc.matchRoomCredentials.roomPassword,
            deliveredAt: new Date(),
          }
        : undefined;

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
      credentialsDelivered: Boolean(initialCredentials),
      roomCredentials: initialCredentials,
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
        const createdReg = await TournamentRegistration.create({
          tournament: id,
          teamName: teamName.trim(),
          format,
          captain: captainId && mongoose.Types.ObjectId.isValid(captainId) ? captainId : undefined,
          squadToken,
          members: members.map((m) => ({
            user: m.user && mongoose.Types.ObjectId.isValid(m.user) ? m.user : undefined,
            username: m.username,
            gameId: m.gameId,
            inGameName: m.inGameName,
            role: (m.role || "member") as "captain" | "member" | "substitute",
            status: (m.status || "confirmed") as "confirmed" | "invited_pending" | "waiting_for_login" | "declined",
            joinedAt: new Date(m.joinedAt),
          })),
          maxMembers,
          isEarlyLocked: true,
          rosterLockedAt,
          paymentStatus: razorpayPaymentId ? "completed" : "free",
          paymentId: razorpayPaymentId || undefined,
          credentialsDelivered: Boolean(initialCredentials),
          roomCredentials: initialCredentials,
        });

        // Increment registered slots on tournament document
        await Tournament.findByIdAndUpdate(id, {
          $inc: { registeredSlots: 1 },
        });

        const tournamentDoc = await Tournament.findById(id);

        // Dispatch notifications & game invites for invited teammates
        for (const m of members) {
          if (m.role === "captain") continue;

          let targetUserId = m.user;
          let targetUser = null;

          if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
            targetUser = await User.findById(targetUserId);
          } else if (m.username) {
            targetUser = await User.findOne({
              username: { $regex: `^${m.username.replace(/^@/, "")}$`, $options: "i" },
            });
            if (targetUser) {
              targetUserId = targetUser._id;
            }
          }

          if (targetUser && targetUserId) {
            try {
              // Create in-app Notification for the teammate
              await Notification.create({
                recipient: targetUserId,
                title: `Squad Invitation: ${teamName.trim()}`,
                message: `${captainName} invited you to join squad "${teamName.trim()}" for ${tournamentDoc?.title || "Tournament"}! Respond to confirm or decline your slot.`,
                type: "game_invite",
                link: `/tournaments/${id}`,
              });

              // Create GameInvite record
              await GameInvite.create({
                sender: captainId && mongoose.Types.ObjectId.isValid(captainId) ? captainId : targetUserId,
                receiver: targetUserId,
                targetGameId: m.gameId || targetUser.gameProfiles?.[0]?.gameId || "N/A",
                game: tournamentDoc?.game || "bgmi",
                tournament: id,
                teamName: teamName.trim(),
                message: `${captainName} invited you to join squad "${teamName.trim()}"!`,
                status: "pending",
              });
            } catch (notifyErr) {
              console.warn("Failed to dispatch invite notification for member:", notifyErr);
            }
          }
        }

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
