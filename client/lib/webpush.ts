import webpush from "web-push";

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

export default webpush;
