// app/api/availability/route.js
// GET /api/availability?date=2025-01-22
// Returns booked time slots for a given date

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query param required (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("slot_datetime")
    .gte("slot_datetime", `${date}T00:00:00`)
    .lte("slot_datetime", `${date}T23:59:59`)
    .neq("status", "CANCELLED");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedTimes = data.map(b => b.slot_datetime.slice(11, 16)); // "HH:MM"

  // Cache for 60 seconds — slots don't change that fast
  return NextResponse.json(
    { date, bookedTimes },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } }
  );
}
