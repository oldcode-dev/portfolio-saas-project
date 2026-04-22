"use client";

import { useState, useEffect } from "react";

const DAYS       = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay(); }
function toKey(y, m, d)       { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }

export default function BookingCalendar({ onSlotSelected }) {
  const today = new Date();
  const [viewYear, setViewYear]     = useState(today.getFullYear());
  const [viewMonth, setViewMonth]   = useState(today.getMonth());
  const [selectedDate, setSelected] = useState(null);
  const [selectedTime, setTime]     = useState(null);
  const [bookedTimes, setBooked]    = useState([]);
  const [loadingSlots, setLoading]  = useState(false);

  // Fetch real availability from Next.js API route whenever date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setBooked([]);
    fetch(`/api/availability?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setBooked(data.bookedTimes || []))
      .catch(() => setBooked([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelected(null); setTime(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelected(null); setTime(null);
  };

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const handleDayClick = (day) => {
    if (isPast(day)) return;
    setSelected(toKey(viewYear, viewMonth, day));
    setTime(null);
  };

  const handleTimeClick = (time) => {
    if (!selectedDate || bookedTimes.includes(time)) return;
    setTime(time);
    onSlotSelected?.({ date: selectedDate, time, display: `${selectedDate} at ${time}` });
  };

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#E2F0F8" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#2D5570", fontWeight: 700, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day    = i + 1;
          const key    = toKey(viewYear, viewMonth, day);
          const past   = isPast(day);
          const isSel  = selectedDate === key;
          const isTo   = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={past}
              style={{
                aspectRatio: "1",
                border: `1px solid ${isSel ? "#00D4FF" : isTo ? "#00D4FF33" : "#153042"}`,
                borderRadius: 8,
                background: isSel ? "rgba(0,212,255,0.18)" : isTo ? "rgba(0,212,255,0.05)" : "transparent",
                color: past ? "#2D5570" : isSel ? "#00D4FF" : "#E2F0F8",
                fontSize: 13, fontWeight: isSel ? 800 : 500,
                cursor: past ? "not-allowed" : "pointer",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >{day}</button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, color: "#5A8FAA", marginBottom: 12, fontWeight: 600 }}>
            {loadingSlots ? "Loading available times…" : `Available times for ${selectedDate}:`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {TIME_SLOTS.map(time => {
              const isBooked = bookedTimes.includes(time);
              const isSel    = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeClick(time)}
                  disabled={isBooked || loadingSlots}
                  style={{
                    padding: "9px 4px",
                    border: `1px solid ${isSel ? "#00D4FF" : isBooked ? "#153042" : "#1E4560"}`,
                    borderRadius: 8,
                    background: isSel ? "rgba(0,212,255,0.16)" : isBooked ? "rgba(0,0,0,0.2)" : "transparent",
                    color: isBooked ? "#2D5570" : isSel ? "#00D4FF" : "#E2F0F8",
                    fontSize: 12, fontWeight: isSel ? 700 : 500,
                    cursor: isBooked ? "not-allowed" : "pointer",
                    textDecoration: isBooked ? "line-through" : "none",
                    fontFamily: "var(--font-mono, monospace)",
                    transition: "all 0.15s",
                  }}
                >{time}</button>
              );
            })}
          </div>
        </div>
      )}

      {selectedTime && (
        <div style={{
          marginTop: 16, background: "rgba(0,255,136,0.06)",
          border: "1px solid rgba(0,255,136,0.25)",
          borderRadius: 10, padding: "10px 14px",
          fontSize: 13, color: "#00FF88", fontWeight: 600,
        }}>
          ✓ Slot reserved: {selectedDate} at {selectedTime}
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background: "transparent", border: "1px solid #153042",
  borderRadius: 8, width: 34, height: 34,
  color: "#5A8FAA", fontSize: 18, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit",
};
