"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase";
import { StatusDot, Spinner } from "@/components/ui/primitives";

const URGENCY_COLOR = { CRITICAL: "#FF3366", HIGH: "#FF6B35", MEDIUM: "#FFB800", LOW: "#00FF88" };
const STATUS_STYLE  = {
  CONFIRMED: { bg: "rgba(0,255,136,0.1)",  color: "#00FF88", border: "#00FF8833" },
  PENDING:   { bg: "rgba(255,184,0,0.1)",  color: "#FFB800", border: "#FFB80033" },
  CANCELLED: { bg: "rgba(255,51,102,0.1)", color: "#FF3366", border: "#FF336633" },
};

const MOCK = [
  { id:"b1", client_name:"Kofi Mensah",  client_phone:"0244112233", service_name:"OS Installation",     slot_datetime:"2025-01-22T09:00:00", deposit_amount:350000, status:"CONFIRMED", urgency:"MEDIUM"   },
  { id:"b2", client_name:"Ama Owusu",    client_phone:"0277445566", service_name:"Malware Removal",     slot_datetime:"2025-01-22T11:00:00", deposit_amount:300000, status:"CONFIRMED", urgency:"HIGH"     },
  { id:"b3", client_name:"Yaw Darko",    client_phone:"0201334455", service_name:"Network Setup",       slot_datetime:"2025-01-23T14:00:00", deposit_amount:700000, status:"PENDING",   urgency:"LOW"      },
  { id:"b4", client_name:"Akua Boateng", client_phone:"0555223344", service_name:"Ransomware Response", slot_datetime:"2025-01-24T10:00:00", deposit_amount:750000, status:"CONFIRMED", urgency:"CRITICAL" },
  { id:"b5", client_name:"Kweku Asante", client_phone:"0266778899", service_name:"RAM/SSD Upgrade",     slot_datetime:"2025-01-25T15:00:00", deposit_amount:250000, status:"CONFIRMED", urgency:"LOW"      },
];

function StatCard({ icon, label, value, color = "#00D4FF" }) {
  return (
    <div style={{ background: "#081318", border: "1px solid #153042", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5A8FAA", marginTop: 3 }}>{label}</div>
    </div>
  );
}

export default function OpsHub() {
  const [bookings, setBookings]       = useState(MOCK);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filter, setFilter]           = useState("ALL");
  const [loading, setLoading]         = useState(false);

  // Subscribe to Supabase real-time in production
  useEffect(() => {
    const supabase = getBrowserClient();
    const channel  = supabase
      .channel("bookings-realtime")
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
  }, []);

  const filtered       = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);
  const totalRevenue   = bookings.filter(b => b.status === "CONFIRMED").reduce((s, b) => s + b.deposit_amount, 0);
  const confirmedCount = bookings.filter(b => b.status === "CONFIRMED").length;
  const pendingCount   = bookings.filter(b => b.status === "PENDING").length;
  const todayCount     = bookings.filter(b => new Date(b.slot_datetime).toDateString() === new Date().toDateString()).length;

  const formatSlot = (dt) => new Date(dt).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#00D4FF", letterSpacing: 3, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", marginBottom: 6 }}>
            ── ADMIN ──
          </div>
          <h1 style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 800, color: "#E2F0F8" }}>Ops Hub</h1>
        </div>

        {/* Availability toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "#081318", border: "1px solid #153042",
          borderRadius: 50, padding: "10px 20px",
        }}>
          <StatusDot status={isAvailable ? "online" : "busy"} />
          <span style={{ fontSize: 13, color: "#E2F0F8", fontWeight: 600 }}>
            {isAvailable ? "Available for Bookings" : "Busy — Paused"}
          </span>
          <button
            onClick={() => setIsAvailable(a => !a)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: isAvailable ? "#00FF88" : "#153042",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s",
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: isAvailable ? "calc(100% - 21px)" : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: "#040B0F", transition: "left 0.25s",
            }} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard icon="💰" label="Total Deposits"      value={`₦${(totalRevenue/100).toLocaleString()}`} color="#00FF88" />
        <StatCard icon="📋" label="Confirmed Bookings"  value={confirmedCount} color="#00D4FF" />
        <StatCard icon="⏳" label="Pending Approval"    value={pendingCount}   color="#FFB800" />
        <StatCard icon="📅" label="Today's Jobs"        value={todayCount}     color="#FF6B35" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["ALL","CONFIRMED","PENDING","CANCELLED"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            background: filter === s ? "#00D4FF" : "transparent",
            border: `1px solid ${filter === s ? "#00D4FF" : "#153042"}`,
            borderRadius: 8, padding: "6px 14px",
            color: filter === s ? "#040B0F" : "#5A8FAA",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            {s} {s !== "ALL" && <span style={{ opacity: 0.7 }}>({bookings.filter(b => b.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#081318", border: "1px solid #153042", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #153042" }}>
                {["Client","Service","Slot","Deposit","Urgency","Status","Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, color: "#2D5570", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const ss = STATUS_STYLE[b.status] || STATUS_STYLE.PENDING;
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #0C1D27", background: i % 2 === 0 ? "transparent" : "rgba(12,29,39,0.3)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#E2F0F8" }}>{b.client_name}</div>
                      <div style={{ fontSize: 11, color: "#5A8FAA", fontFamily: "var(--font-mono, monospace)" }}>{b.client_phone}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#E2F0F8", maxWidth: 180 }}>{b.service_name}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#5A8FAA", whiteSpace: "nowrap", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatSlot(b.slot_datetime)}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#00FF88" }}>
                      ₦{(b.deposit_amount/100).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 12, color: URGENCY_COLOR[b.urgency] || "#5A8FAA", fontWeight: 700 }}>{b.urgency}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: ss.bg, border: `1px solid ${ss.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: ss.color, fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={actionBtn("#00D4FF")}>View</button>
                        <button style={actionBtn("#FF3366")}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#2D5570" }}>
            No {filter.toLowerCase()} bookings found.
          </div>
        )}
      </div>
    </div>
  );
}

const actionBtn = (color) => ({
  background: "transparent", border: `1px solid ${color}44`,
  borderRadius: 6, padding: "4px 10px",
  color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
});
