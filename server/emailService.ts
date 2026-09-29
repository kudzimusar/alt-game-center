const RESEND_API_URL = "https://api.resend.com/emails";

function getResendKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

function getFromAddress(): string {
  return process.env.FROM_EMAIL || "ALT Game Center <onboarding@resend.dev>";
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  bcc?: string[];
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = getResendKey();
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — email not sent:", payload.subject);
    return { ok: false, error: "Email not configured (RESEND_API_KEY missing)" };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {}),
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
        ...(payload.bcc ? { bcc: payload.bcc } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as any;

    if (!res.ok) {
      console.error("[Email] Resend error:", data);
      return { ok: false, error: data.message || "Send failed" };
    }

    console.log(`[Email] Sent "${payload.subject}" to ${Array.isArray(payload.to) ? payload.to.length + " recipients" : payload.to}`);
    return { ok: true, id: data.id };
  } catch (err: any) {
    console.error("[Email] Send error:", err.message);
    return { ok: false, error: err.message };
  }
}

// ── HTML Email Templates ───────────────────────────────────────────────────────

function baseTemplate(content: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ALT Game Center</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a,#6d28d9);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:28px;">🎮</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">ALT Game Center</h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">Interactive English Games for Japanese Classrooms</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px;border-left:1px solid #334155;border-right:1px solid #334155;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;border:1px solid #1e293b;border-top:none;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#475569;font-size:12px;">
                © 2026 ALT Game Center · Interactive English Education
              </p>
              <p style="margin:0;color:#334155;font-size:11px;">
                You received this email because you have an account with ALT Game Center.<br/>
                <a href="{{unsubscribe_url}}" style="color:#6366f1;text-decoration:none;">Unsubscribe</a> from marketing emails
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string, color = "#4f46e5"): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto;">
    <tr>
      <td style="background:${color};border-radius:12px;text-align:center;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #334155;margin:28px 0;" />`;
}

function featureRow(icon: string, title: string, desc: string): string {
  return `<tr>
    <td style="padding:10px 0;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:16px;font-size:24px;vertical-align:top;">${icon}</td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 2px;color:#e2e8f0;font-size:15px;font-weight:700;">${title}</p>
          <p style="margin:0;color:#94a3b8;font-size:13px;">${desc}</p>
        </td>
      </tr></table>
    </td>
  </tr>`;
}

// ── Welcome Email ─────────────────────────────────────────────────────────────
export function buildWelcomeEmail(name: string, email: string, appUrl: string): string {
  const content = `
    <h2 style="margin:0 0 4px;color:#f1f5f9;font-size:22px;font-weight:800;">Welcome to ALT Game Center, ${name}! 🎉</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Your account has been created for <strong style="color:#e2e8f0;">${email}</strong></p>

    <p style="margin:0 0 20px;color:#cbd5e1;font-size:15px;line-height:1.6;">
      You now have access to <strong style="color:#a5b4fc;">19 interactive English games</strong> designed for Japanese junior high school classrooms. Start engaging your students today!
    </p>

    ${btn("Go to My Dashboard", `${appUrl}/dashboard`)}
    ${divider()}

    <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">What you can do:</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${featureRow("⚡", "Flash Card Race", "Vocabulary & kanji flash cards with QR student joining")}
      ${featureRow("⚔️", "Class Battle", "Real-time class-wide quiz competitions")}
      ${featureRow("🎤", "Interview Bingo", "Conversation practice bingo for speaking skills")}
      ${featureRow("⛳", "Grammar Golf", "Fill-in-the-blank grammar MCQs aligned to MEXT")}
      ${featureRow("🎮", "16 more games...", "Speaking, listening, reading & writing activities")}
    </table>
    ${divider()}

    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
      Need help getting started? Reply to this email — we're happy to assist.<br/>
      Your account uses: <strong style="color:#94a3b8;">${email}</strong>
    </p>
  `;
  return baseTemplate(content, `Welcome to ALT Game Center — 19 interactive English games for your classroom`).replace("{{unsubscribe_url}}", `${appUrl}/unsubscribe`);
}

// ── Access Granted Email ──────────────────────────────────────────────────────
export function buildAccessGrantedEmail(name: string, plan: string, appUrl: string): string {
  const planLabels: Record<string, string> = { starter: "Starter", pro: "Pro Teacher", school: "School", district: "District", free: "Free" };
  const planLabel = planLabels[plan] || plan;
  const content = `
    <h2 style="margin:0 0 4px;color:#f1f5f9;font-size:22px;font-weight:800;">Your access has been activated! ✅</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Hi ${name}, your <strong style="color:#a5b4fc;">${planLabel} Plan</strong> is now active</p>

    <p style="margin:0 0 20px;color:#cbd5e1;font-size:15px;line-height:1.6;">
      You now have full access to ALT Game Center. All 19 games are unlocked and ready for your classroom.
    </p>

    ${btn("Start Playing Games", `${appUrl}/games`, "#059669")}
    ${divider()}

    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
      Questions about your subscription? Reply to this email and we'll help you out.
    </p>
  `;
  return baseTemplate(content, "Your ALT Game Center access is now active").replace("{{unsubscribe_url}}", `${appUrl}/unsubscribe`);
}

// ── Newsletter Template ───────────────────────────────────────────────────────
export function buildNewsletterEmail(subject: string, htmlBody: string, appUrl: string, unsubToken: string): string {
  const content = `
    <div style="color:#cbd5e1;font-size:15px;line-height:1.7;">
      ${htmlBody}
    </div>
    ${divider()}
    <p style="margin:0;color:#64748b;font-size:12px;text-align:center;">
      You're receiving this because you're subscribed to ALT Game Center updates.<br/>
      <a href="${appUrl}/unsubscribe?token=${unsubToken}" style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
    </p>
  `;
  return baseTemplate(content, subject).replace("{{unsubscribe_url}}", `${appUrl}/unsubscribe?token=${unsubToken}`);
}

// ── System Notification ───────────────────────────────────────────────────────
export function buildSystemEmail(title: string, message: string, ctaText?: string, ctaUrl?: string, appUrl = "https://alt-game-center.online"): string {
  const content = `
    <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:20px;font-weight:800;">${title}</h2>
    <div style="color:#cbd5e1;font-size:15px;line-height:1.7;">${message}</div>
    ${ctaText && ctaUrl ? btn(ctaText, ctaUrl) : ""}
  `;
  return baseTemplate(content, title).replace("{{unsubscribe_url}}", `${appUrl}/unsubscribe`);
}
