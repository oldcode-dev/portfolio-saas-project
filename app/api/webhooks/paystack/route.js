// app/api/webhooks/paystack/route.js
// Next.js App Router Route Handler — replaces src/serverless/paystackWebhook.js
//
// Register this URL in Paystack Dashboard:
//   Settings → API Keys & Webhooks → Webhook URL
//   https://your-domain.com/api/webhooks/paystack

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

// ── Supabase (service role — server only, never sent to browser) ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Twilio client ─────────────────────────────────────────────
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── Helpers ───────────────────────────────────────────────────
function verifySignature(rawBody, incoming) {
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(incoming, "hex")
    );
  } catch {
    return false; // length mismatch
  }
}

function normalizePhone(raw, prefix = "+233") {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233") || digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `${prefix}${digits.slice(1)}`;
  return `${prefix}${digits}`;
}

function buildAdminMessage(booking, diagnosticSummary) {
  const slot = new Date(booking.slot_datetime).toLocaleString("en-GH", {
    dateStyle: "full", timeStyle: "short", timeZone: "Africa/Accra",
  });
  return [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🔔 *NEW BOOKING CONFIRMED*",
    "━━━━━━━━━━━━━━━━━━━━━━",
    `👤 *Client:* ${booking.client_name}`,
    `📞 *Phone:* ${booking.client_phone}`,
    `📍 *Location:* ${booking.client_location}`,
    "",
    `🔧 *Service:* ${booking.service_name}`,
    `⏰ *Slot:* ${slot}`,
    `💰 *Deposit:* ₦${(booking.deposit_amount / 100).toLocaleString()}`,
    `🚨 *Urgency:* ${booking.urgency}`,
    "",
    "📋 *Diagnostic Path:*",
    diagnosticSummary,
    "",
    `🔗 *Ref:* \`${booking.payment_ref}\``,
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Reply *DONE* when complete · *RESCHEDULE* to move slot",
  ].join("\n");
}

function buildClientSMS(booking) {
  const slot = new Date(booking.slot_datetime).toLocaleString("en-GH", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra",
  });
  return (
    `✅ Confirmed! Service: ${booking.service_name}. ` +
    `Slot: ${slot}. Location: ${booking.client_location}. ` +
    `Ref: ${booking.payment_ref}. — Digital Service Bay`
  );
}

function buildDiagnosticSummary(path) {
  if (!Array.isArray(path) || path.length === 0) return "Direct booking (no triage)";
  return path.map((s, i) => `${i + 1}. ${s.selectedLabel || s.selectedValue}`).join("\n");
}

// ── Route Handler ─────────────────────────────────────────────
export async function POST(request) {
  // Read raw body for HMAC verification
  const rawBody  = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  if (!verifySignature(rawBody, signature)) {
    console.error("[PAYSTACK WEBHOOK] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, action: "ignored" });
  }

  const paymentRef = event.data.reference;
  const amountPaid = event.data.amount; // kobo

  try {
    // 1. Fetch booking
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_ref", paymentRef)
      .single();

    if (fetchErr || !booking) {
      console.error("[DB] Booking not found:", paymentRef);
      return NextResponse.json({ received: true, error: "Booking not found" });
    }

    // 2. Idempotency guard
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ received: true, action: "already_confirmed" });
    }

    // 3. Update status
    const { error: updateErr } = await supabase
      .from("bookings")
      .update({ status: "CONFIRMED", deposit_amount: amountPaid, confirmed_at: new Date().toISOString() })
      .eq("id", booking.id);

    if (updateErr) throw new Error(`DB update failed: ${updateErr.message}`);

    // 4. Notifications
    const diagnosticSummary = buildDiagnosticSummary(booking.diagnostic_path);

    const [waResult, smsResult] = await Promise.all([
      twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to:   process.env.ADMIN_WHATSAPP_NUMBER,
        body: buildAdminMessage(booking, diagnosticSummary),
      }),
      twilioClient.messages.create({
        from: process.env.TWILIO_SMS_NUMBER,
        to:   normalizePhone(booking.client_phone),
        body: buildClientSMS(booking),
      }),
    ]);

    console.log(`[WEBHOOK] Booking ${booking.id} confirmed. WA: ${waResult.sid} SMS: ${smsResult.sid}`);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      adminWaSid: waResult.sid,
      clientSmsSid: smsResult.sid,
    });

  } catch (err) {
    console.error("[WEBHOOK ERROR]", err.message);
    // Always 200 to Paystack — prevents retry loops
    return NextResponse.json({ received: true, internalError: err.message });
  }
}

// Paystack only sends POST — reject everything else
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
