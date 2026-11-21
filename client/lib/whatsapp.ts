export interface WhatsAppMessagePayload {
  toPhone: string; // e.g. "+919876543210" or "9876543210"
  type: 
    | "otp_registration"
    | "otp_password_reset"
    | "registration_confirmed"
    | "room_credentials"
    | "game_invite"
    | "winning_message"
    | "result_verified"
    | "template_test";
  templateParams: {
    otp?: string;
    playerName?: string;
    teamName?: string;
    tournamentName?: string;
    gameTitle?: string;
    matchNumber?: number;
    matchStartTime?: string;
    squadToken?: string;
    roomId?: string;
    roomPassword?: string;
    placement?: number;
    eliminations?: number;
    totalPoints?: number;
    prizeAmount?: number | string;
    lobbyUrl?: string;
    inviteUrl?: string;
    templateName?: string;
    templateLanguage?: string;
    templateBodyParameters?: string[];
  };
}

export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return digits;
}

export async function sendWhatsAppMessage(
  payload: WhatsAppMessagePayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { toPhone, type, templateParams } = payload;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  const formattedPhone = formatWhatsAppPhone(toPhone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return { success: false, error: "Invalid WhatsApp phone number format." };
  }

  let messageText = "";

  switch (type) {
    case "otp_registration":
      messageText = 
        `🔐 *MVP ARENA VERIFICATION OTP* 🔐\n\n` +
        `Welcome to MVP Arena! Your registration verification code is:\n\n` +
        `👉 *${templateParams.otp}*\n\n` +
        `⏳ Valid for 10 minutes.\n` +
        `🛡️ Do not share this OTP with anyone. Institutional anti-cheat standard.`;
      break;

    case "otp_password_reset":
      messageText = 
        `🔑 *MVP ARENA PASSWORD RESET* 🔑\n\n` +
        `We received a password reset request for your athlete account.\n\n` +
        `Your verification OTP is:\n` +
        `👉 *${templateParams.otp}*\n\n` +
        `⏳ Valid for 10 minutes.\n` +
        `⚠️ If you did not request this, please secure your account immediately.`;
      break;

    case "registration_confirmed":
      messageText = 
        `✅ *TOURNAMENT REGISTRATION CONFIRMED* ✅\n\n` +
        `Player/Captain: *${templateParams.playerName || "Athlete"}*\n` +
        `Squad: *${templateParams.teamName || "Solo Athlete"}*\n` +
        `Tournament: *${templateParams.tournamentName || "Championship"}*\n` +
        `Title: *${(templateParams.gameTitle || "BGMI").toUpperCase()}*\n` +
        (templateParams.squadToken ? `🔑 Squad Token: *${templateParams.squadToken}*\n` : "") +
        (templateParams.matchStartTime ? `⏰ Kickoff: *${templateParams.matchStartTime}*\n\n` : "\n") +
        `Your slot has been secured. Room ID & Password will be delivered right here on WhatsApp 10-15 minutes prior to match start!`;
      break;

    case "room_credentials":
      messageText = 
        `🚨 *MVP ARENA MATCH LOBBY CREDENTIALS* 🚨\n\n` +
        `🏆 Tournament: *${templateParams.tournamentName || "Esports Championship"}*\n` +
        `⚔️ Match: *#${templateParams.matchNumber || 1}*\n\n` +
        `🔑 *Room ID:* *${templateParams.roomId}*\n` +
        `🔒 *Password:* *${templateParams.roomPassword}*\n\n` +
        `⏰ *ENTRY WINDOW:* Room is LIVE! Join within 10 minutes.\n` +
        `📲 Direct Match Lobby: ${templateParams.lobbyUrl || "https://mvparena.gg"}`;
      break;

    case "game_invite":
      messageText = 
        `🎮 *MVP ARENA SQUAD INVITATION* 🎮\n\n` +
        `*${templateParams.playerName || "Team Captain"}* has formally invited you to join squad *"${templateParams.teamName || "Lineup"}"* for *${templateParams.tournamentName || "Upcoming Scrims"}*!\n\n` +
        (templateParams.squadToken ? `🔑 Squad Access Token: *${templateParams.squadToken}*\n\n` : "") +
        `📲 Claim your slot and verify roster: ${templateParams.inviteUrl || "https://mvparena.gg/social"}`;
      break;

    case "winning_message":
      messageText = 
        `🏆 *CONGRATULATIONS CHAMPION!* 🏆\n\n` +
        `Squad: *${templateParams.teamName || "Your Squad"}*\n` +
        `Tournament: *${templateParams.tournamentName || "Championship"}*\n` +
        `🎖️ Final Placement: *#${templateParams.placement || 1}*\n` +
        `🎯 Confirmed Kills: *${templateParams.eliminations || 0}*\n` +
        `⭐ Total Points: *${templateParams.totalPoints || 0}*\n` +
        (templateParams.prizeAmount ? `💰 Prize Payout: *₹${templateParams.prizeAmount}*\n\n` : "\n") +
        `Your placement has been certified on the official MVP Arena Leaderboard! Winnings are queued for automated UPI settlement.`;
      break;

    case "result_verified":
      messageText = 
        `📊 *MATCH RESULT CERTIFIED* 📊\n\n` +
        `Tournament: *${templateParams.tournamentName}*\n` +
        `🎖️ Placement: *#${templateParams.placement}*\n` +
        `🎯 Eliminations: *${templateParams.eliminations}*\n` +
        `⭐ Points Awarded: *${templateParams.totalPoints}*\n\n` +
        `Standings have been officially updated on MVP Arena.`;
      break;
  }

  // 1. If Meta WhatsApp Cloud API credentials exist in environment:
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";
  const activePhoneId = phoneId || "1406383182562797";

  if (token && activePhoneId) {
    try {
      // Determine if template message should be sent
      const isTemplate = type === "template_test" || Boolean(templateParams.templateName);

      const requestBody = isTemplate
        ? {
            messaging_product: "whatsapp",
            to: formattedPhone,
            type: "template",
            template: {
              name: templateParams.templateName || "jaspers_market_order_confirmation_v1",
              language: { code: templateParams.templateLanguage || "en_US" },
              components: [
                {
                  type: "body",
                  parameters: (
                    templateParams.templateBodyParameters || [
                      templateParams.playerName || "Athlete",
                      templateParams.otp || templateParams.squadToken || "123456",
                      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    ]
                  ).map((text) => ({ type: "text", text: String(text) })),
                },
              ],
            },
          }
        : {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: { preview_url: true, body: messageText },
          };

      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${activePhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.messages?.[0]?.id };
      }
      console.warn("[WhatsApp Cloud API Error]:", data);
      return { success: false, error: data?.error?.message || "WhatsApp API request failed" };
    } catch (err) {
      console.warn("[WhatsApp API] Live dispatch error:", (err as Error).message);
      return { success: false, error: (err as Error).message };
    }
  }

  // 2. Production Fallback / Simulation Logger:
  console.log(`\n======================================================`);
  console.log(`📱 [WhatsApp Dispatch to +${formattedPhone}] [Type: ${type}]`);
  console.log(messageText);
  console.log(`======================================================\n`);

  return { success: true, messageId: `wa_msg_${Date.now()}` };
}
