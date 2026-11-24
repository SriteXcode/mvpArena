export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerBrowserPush(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, error: "Push notifications not supported on this device/browser." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission denied." };
    }

    // Fetch VAPID public key
    let vapidKey = "";
    try {
      const vapidRes = await fetch("/api/push/vapid-key");
      const vapidData = await vapidRes.json();
      vapidKey = vapidData.publicKey;
    } catch {}

    if (!vapidKey) {
      vapidKey = "BAiZJjKX6wSg0OeyHcvT2TswjFab_k4qvlz2f3JZItV9VlyZ2GbzTMh7jhuEvV3MAoTim7SMcYPxF6E8IidZRGA";
    }

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    const data = await res.json();
    return { success: Boolean(data.success) };
  } catch (err) {
    console.warn("Failed to register browser push subscription:", err);
    return { success: false, error: (err as Error).message };
  }
}
