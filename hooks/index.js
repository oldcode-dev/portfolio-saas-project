"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase";

// ── useBookings — real-time Supabase subscription ─────────────
export function useBookings({ status, date } = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const supabase = getBrowserClient();

    let query = supabase
      .from("bookings")
      .select("*")
      .order("slot_datetime", { ascending: true });

    if (status) query = query.eq("status", status);
    if (date)   query = query
      .gte("slot_datetime", `${date}T00:00:00`)
      .lte("slot_datetime", `${date}T23:59:59`);

    query.then(({ data, error: err }) => {
      if (err) setError(err.message);
      else     setBookings(data || []);
      setLoading(false);
    });

    const channel = supabase
      .channel("bookings-hook")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, payload => {
        setBookings(prev => {
          if (payload.eventType === "INSERT") return [...prev, payload.new];
          if (payload.eventType === "UPDATE") return prev.map(b => b.id === payload.new.id ? payload.new : b);
          if (payload.eventType === "DELETE") return prev.filter(b => b.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [status, date]);

  const totalRevenue = bookings
    .filter(b => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.deposit_amount || 0), 0);

  return { bookings, loading, error, totalRevenue };
}

// ── useAvailability — fetches from Next.js API route ──────────
export function useAvailability(date) {
  const [bookedSlots, setBooked]  = useState([]);
  const [loading,     setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => setBooked(d.bookedTimes || []))
      .catch(() => setBooked([]))
      .finally(() => setLoading(false));
  }, [date]);

  return { bookedSlots, isSlotAvailable: (t) => !bookedSlots.includes(t), loading };
}

// ── useAdminStatus — availability toggle with Supabase persist ─
export function useAdminStatus() {
  const [isAvailable, setIsAvailable] = useState(true);

  const toggle = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    const supabase = getBrowserClient();
    await supabase
      .from("settings")
      .upsert({ key: "admin_available", value: String(next) });
  };

  // Load initial state
  useEffect(() => {
    const supabase = getBrowserClient();
    supabase
      .from("settings")
      .select("value")
      .eq("key", "admin_available")
      .single()
      .then(({ data }) => {
        if (data) setIsAvailable(data.value !== "false");
      })
      .catch(() => {});
  }, []);

  return { isAvailable, toggle };
}
