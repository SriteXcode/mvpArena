import nodemailer from "nodemailer";

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  type: "password_reset" | "campaign" | "custom";
  templateParams: {
    name?: string;
    resetUrl?: string;
    resetToken?: string;
    campaignTitle?: string;
    campaignBody?: string;
    ctaUrl?: string;
    ctaText?: string;
  };
}

export function generateEmailHtml(payload: SendEmailPayload): string {
  const { type, templateParams, subject } = payload;

  let bodyContent = "";

  if (type === "password_reset") {
    bodyContent = `
      <div style="padding: 24px 0;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 12px; font-family: monospace;">
          RESET YOUR ACCOUNT PASSWORD
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${templateParams.name || "Athlete"},<br>
          We received a formal request to reset the password for your MVP Arena competitive account.
        </p>

        ${
          templateParams.resetToken
            ? `
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace; display: block; margin-bottom: 6px;">
              Your 6-Digit Password Reset OTP
            </span>
            <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #059669; font-family: monospace;">
              ${templateParams.resetToken}
            </span>
          </div>
          `
            : ""
        }

        ${
          templateParams.resetUrl
            ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${templateParams.resetUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">
              Reset Password &rarr;
            </a>
          </div>
          `
            : ""
        }

        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #e2e8f0; pt: 16px;">
          ⏳ This verification token will expire in <strong>15 minutes</strong>.<br>
          🛡️ If you did not request this password reset, no action is needed. Your account remains protected by MVP Arena institutional anti-cheat governance.
        </p>
      </div>
    `;
  } else if (type === "campaign") {
    bodyContent = `
      <div style="padding: 24px 0;">
        <span style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; font-family: monospace;">
          OFFICIAL ANNOUNCEMENT
        </span>
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 16px 0 12px; font-family: monospace;">
          ${templateParams.campaignTitle || subject}
        </h2>
        <div style="color: #334155; font-size: 14px; line-height: 1.7; margin-bottom: 24px; white-space: pre-line;">
          ${templateParams.campaignBody || ""}
        </div>

        ${
          templateParams.ctaUrl
            ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${templateParams.ctaUrl}" style="background-color: #059669; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              ${templateParams.ctaText || "Enter Arena"} &rarr;
            </a>
          </div>
          `
            : ""
        }
      </div>
    `;
  } else {
    bodyContent = `<div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">${templateParams.campaignBody || ""}</div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; font-family: monospace;">
                      MVP<span style="color: #10b981;">ARENA</span>
                    </span>
                    <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">
                      Institutional Mobile Esports Infrastructure
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 24px 32px;">
                    ${bodyContent}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin: 0;">
                      &copy; 2026 MVP Arena Competitive League. All rights reserved.<br>
                      Strict anti-cheat governance &bull; Certified fixture audit verification &bull; Automated season progression.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendEmail(
  payload: SendEmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject } = payload;
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "MVP Arena <notifications@mvparena.gg>";

  const recipients = Array.isArray(to) ? to : [to];
  const htmlContent = generateEmailHtml(payload);

  // 1. SMTP Dispatch (Gmail / Custom SMTP)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ""),
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: recipients.join(", "),
        subject,
        html: htmlContent,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn("[SMTP Dispatch Error]:", (err as Error).message);
    }
  }

  // 2. Resend API Dispatch
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipients,
          subject,
          html: htmlContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, messageId: data.id };
      }
      console.warn("[Resend Email Error]:", data);
    } catch (err) {
      console.warn("[Resend Dispatch Error]:", (err as Error).message);
    }
  }

  // 2. SendGrid API Dispatch
  if (sendgridApiKey) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: recipients.map((r) => ({ to: [{ email: r }] })),
          from: { email: fromEmail.includes("<") ? fromEmail.split("<")[1].replace(">", "") : fromEmail },
          subject,
          content: [{ type: "text/html", value: htmlContent }],
        }),
      });
      if (res.ok || res.status === 202) {
        return { success: true, messageId: `sg_${Date.now()}` };
      }
    } catch (err) {
      console.warn("[SendGrid Dispatch Error]:", (err as Error).message);
    }
  }

  // 3. Fallback Development & Testing Simulation Logger
  console.log(`\n======================================================`);
  console.log(`📧 [Email Dispatch to ${recipients.join(", ")}]`);
  console.log(`Subject: ${subject}`);
  console.log(`Type: ${payload.type}`);
  console.log(`Preview: ${payload.templateParams.campaignTitle || payload.templateParams.resetToken || "Password Reset / Notification"}`);
  console.log(`======================================================\n`);

  return { success: true, messageId: `mock_email_${Date.now()}` };
}
