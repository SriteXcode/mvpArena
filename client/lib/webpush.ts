import * as webpush from "web-push";

export const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BAiZJjKX6wSg0OeyHcvT2TswjFab_k4qvlz2f3JZItV9VlyZ2GbzTMh7jhuEvV3MAoTim7SMcYPxF6E8IidZRGA";

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "nV9CgySpXRV3Y6jRndjw6jIMLB3IQqA3v2EwF_Wc3Eg";

export const VAPID_SUBJECT = "mailto:admin@playarena.gg";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export async function sendWebPush(
  subscription: { endpoint: string; keys: { auth: string; p256dh: string } },
  payload: PushPayload
): Promise<boolean> {
  try {
    const stringifiedPayload = JSON.stringify({
      ...payload,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
    });

    await webpush.sendNotification(subscription, stringifiedPayload);
    return true;
  } catch (error) {
    console.warn("[WebPush] Notification delivery failed:", (error as Error).message);
    return false;
  }
}

export async function dispatchRoomCredentialsPush({
  tournamentId,
  tournamentTitle,
  roomId,
  roomPassword,
}: {
  tournamentId: string;
  tournamentTitle: string;
  roomId: string;
  roomPassword: string;
}): Promise<{ sentCount: number; userCount: number }> {
  try {
    const connectToDatabase = (await import("@/lib/mongodb")).default;
    await connectToDatabase();

    const TournamentRegistration = (await import("@/models/TournamentRegistration")).default;
    const User = (await import("@/models/User")).default;
    const Notification = (await import("@/models/Notification")).default;

    // 1. Find all registrations for this tournament
    const registrations = await TournamentRegistration.find({
      tournament: tournamentId,
    }).select("captain members").lean();

    const userIds = new Set<string>();
    for (const reg of registrations) {
      if (reg.captain) {
        userIds.add(reg.captain.toString());
      }
      if (Array.isArray(reg.members)) {
        for (const m of reg.members) {
          if (m?.user) {
            userIds.add(m.user.toString());
          }
        }
      }
    }

    if (userIds.size === 0) {
      return { sentCount: 0, userCount: 0 };
    }

    // 2. Fetch users with push subscriptions
    const users = await User.find({
      _id: { $in: Array.from(userIds) },
    }).select("_id pushSubscriptions").lean();

    let sentCount = 0;
    const payload: PushPayload = {
      title: "🚨 Room Details Revealed!",
      body: `Room ID: ${roomId} | Pass: ${roomPassword} for ${tournamentTitle}. Join your custom match now!`,
      url: `/tournaments/${tournamentId}`,
      tag: `room_creds_${tournamentId}`,
    };

    // 3. Dispatch web push to all user subscriptions
    for (const u of users) {
      if (Array.isArray(u.pushSubscriptions) && u.pushSubscriptions.length > 0) {
        for (const sub of u.pushSubscriptions) {
          if (sub?.endpoint && sub?.keys?.auth && sub?.keys?.p256dh) {
            const ok = await sendWebPush(sub, payload);
            if (ok) sentCount++;
          }
        }
      }

      // Also create persistent in-app Notification record
      try {
        await Notification.create({
          recipient: u._id,
          title: "🚨 Room Details Revealed!",
          message: `Custom Room ID: ${roomId} and Password: ${roomPassword} have been revealed for ${tournamentTitle}. Join the match lobby now!`,
          type: "match_credentials",
          link: `/tournaments/${tournamentId}`,
          channelsDispatched: {
            socket: false,
            webPush: Boolean(u.pushSubscriptions && u.pushSubscriptions.length > 0),
            fcm: false,
            whatsapp: false,
          },
        });
      } catch (notifErr) {
        console.warn("Failed to create in-app notification:", notifErr);
      }
    }

    console.log(
      `🔔 [WebPush] Dispatched room credentials to ${sentCount} device(s) across ${users.length} registered player(s) for tournament ${tournamentId}`
    );
    return { sentCount, userCount: users.length };
  } catch (err) {
    console.error("Error dispatching room credentials push notifications:", err);
    return { sentCount: 0, userCount: 0 };
  }
}

export default webpush;
