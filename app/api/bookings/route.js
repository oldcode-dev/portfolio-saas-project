// app/api/bookings/route.js
// GET  /api/bookings          — list bookings (admin)
// POST /api/bookings          — create a new booking (client-side after payment)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── GET — list all bookings (admin use) ───────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const date   = searchParams.get("date");

  let query = supabase
    .from("bookings")
    .select("*")
    .order("slot_datetime", { ascending: true });

  if (status) query = query.eq("status", status);
  if (date)   query = query
    .gte("slot_datetime", `${date}T00:00:00`)
    .lte("slot_datetime", `${date}T23:59:59`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

// ── POST — create a booking after successful payment ──────────
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    clientName, clientPhone, clientEmail, clientLocation,
    serviceName, servicePrice, depositAmount, urgency,
    diagnosticPath, slotDatetime, paymentRef, notes,
  } = body;

  // Validate required fields
  const required = { clientName, clientPhone, clientLocation, serviceName, slotDatetime, paymentRef };
  const missing  = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
  }

  // Idempotency: check for duplicate payment_ref
  const { data: existing } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("payment_ref", paymentRef)
    .single();

  if (existing) {
    return NextResponse.json({ bookingId: existing.id, status: existing.status, duplicate: true });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      client_name:     clientName,
      client_phone:    clientPhone,
      client_email:    clientEmail || null,
      client_location: clientLocation,
      service_name:    serviceName,
      service_price:   servicePrice || null,
      deposit_amount:  depositAmount,
      urgency:         urgency || "MEDIUM",
      diagnostic_path: diagnosticPath || null,
      slot_datetime:   slotDatetime,
      payment_ref:     paymentRef,
      status:          "CONFIRMED",
      notes:           notes || null,
    }])
    .select()
    .single();

  if (error) {
    console.error("[POST /api/bookings]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookingId: data.id, status: "CONFIRMED" }, { status: 201 });
}
