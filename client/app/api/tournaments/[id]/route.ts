import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentRegistration from "@/models/TournamentRegistration";
import { requireRole, getCurrentUser } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { dispatchRoomCredentialsPush } from "@/lib/webpush";

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

    // Determine credential visibility:
    // Credentials only reveal to players exactly 10 minutes before the match start time!
    const currentUser = await getCurrentUser();
    const organizerId = (tournament.organizer as any)?._id?.toString() || tournament.organizer?.toString();
    const isOrganizerOrAdmin =
      currentUser?.role === "super_admin" ||
      (currentUser && organizerId && currentUser.userId === organizerId);

    const matchTime = tournament.tournamentDate ? new Date(tournament.tournamentDate).getTime() : 0;
    const tenMinutesBefore = matchTime > 0 ? matchTime - 10 * 60 * 1000 : 0;
    const isWithinTenMinutes = matchTime === 0 || Date.now() >= tenMinutesBefore;

    const tournamentObj: any = tournament.toObject ? tournament.toObject() : { ...tournament };

    const creds = tournament.matchRoomCredentials;
    if (creds && tournamentObj.matchRoomCredentials) {
      if (!isOrganizerOrAdmin && !isWithinTenMinutes) {
        // Redact credentials until 10 minutes before kickoff
        tournamentObj.matchRoomCredentials = {
          roomId: "",
          roomPassword: "",
          isConfigured: Boolean(creds.roomId),
          revealsAt: tenMinutesBefore > 0 ? new Date(tenMinutesBefore).toISOString() : null,
          revealed: false,
        };
      } else {
        tournamentObj.matchRoomCredentials = {
          ...tournamentObj.matchRoomCredentials,
          revealed: true,
        };

        // When 10-minute window is open, deliver WhatsApp credentials & Web Push to registered squad athletes
        if (isWithinTenMinutes && creds.roomId && creds.roomPassword) {
          (async () => {
            try {
              const pendingRegs = await TournamentRegistration.find({
                tournament: tournament._id,
                credentialsDelivered: { $ne: true },
              }).populate("captain", "name username whatsappNumber");

              if (pendingRegs.length > 0) {
                // Dispatch Web Push notifications to all registered athletes' devices
                dispatchRoomCredentialsPush({
                  tournamentId: tournament._id.toString(),
                  tournamentTitle: tournament.title || "MVP Arena Championship",
                  roomId: creds.roomId,
                  roomPassword: creds.roomPassword,
                }).catch((pushErr) => {
                  console.warn("Background web push dispatch error:", pushErr);
                });
              }

              for (const reg of pendingRegs) {
                reg.credentialsDelivered = true;
                reg.roomCredentials = {
                  roomId: creds.roomId,
                  roomPassword: creds.roomPassword,
                  deliveredAt: new Date(),
                };
                await reg.save();

                const captain = reg.captain as unknown as { whatsappNumber?: string; name?: string } | null;
                if (captain?.whatsappNumber) {
                  await sendWhatsAppMessage({
                    toPhone: captain.whatsappNumber,
                    type: "room_credentials",
                    templateParams: {
                      tournamentName: tournament.title || "MVP Arena Championship",
                      matchNumber: 1,
                      roomId: creds.roomId,
                      roomPassword: creds.roomPassword,
                      lobbyUrl: `https://mvparena.gg/matches/${tournament._id}`,
                    },
                  });
                }
              }
            } catch (notifyErr) {
              console.warn("Background 10-min credential delivery error:", notifyErr);
            }
          })().catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true, data: tournamentObj });
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
