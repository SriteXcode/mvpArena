"use client";

// Client-side helper to load Razorpay Standard Checkout script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // Already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentOptions {
  tournamentId: string;
  tournamentTitle: string;
  amount: number; // in INR
  user: {
    name: string;
    email: string;
    whatsappNumber?: string;
  };
  onSuccess: (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
  onFailure: (error: string) => void;
}

export async function processRazorpayPayment(options: RazorpayPaymentOptions) {
  const { tournamentId, tournamentTitle, amount, user, onSuccess, onFailure } = options;

  try {
    // 1. Create order on server
    const orderRes = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId,
        amount,
      }),
    });

    const orderData = await orderRes.json();
    if (!orderData.success) {
      onFailure(orderData.error || "Failed to create payment order.");
      return;
    }

    // 2. Handle Simulation / Mock Mode when Razorpay keys are not yet configured in env
    if (orderData.isMock) {
      console.info("[Razorpay Simulation]: Using mock payment flow since API keys are in simulation mode.");
      setTimeout(() => {
        onSuccess({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "simulated_valid_signature",
        });
      }, 1000);
      return;
    }

    // 3. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      onFailure("Unable to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    // 4. Open Razorpay Checkout modal
    const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    const rzpOptions = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "MVP Arena Esports",
      description: `Registration Entry Fee: ${tournamentTitle}`,
      image: "/logo.png",
      order_id: orderData.orderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.whatsappNumber || "",
      },
      theme: {
        color: "#10b981", // Emerald 500
      },
      handler: function (response: any) {
        onSuccess({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          onFailure("Payment window closed before completing transaction.");
        },
      },
    };

    const razorpayInstance = new (window as any).Razorpay(rzpOptions);
    razorpayInstance.on("payment.failed", function (response: any) {
      onFailure(response.error?.description || "Payment failed at gateway.");
    });

    razorpayInstance.open();
  } catch (error: any) {
    onFailure(error.message || "An error occurred during payment processing.");
  }
}
