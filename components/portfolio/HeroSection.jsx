"use client";

import { useRouter } from "next/navigation";
import { StatusDot, Button } from "@/components/ui/primitives";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section style={{
      minHeight: "90vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "60px 20px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "10%",
        width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
        {/* Status badge */}
        <div className="animate-fadeUp" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)",
          borderRadius: 20, padding: "6px 16px", marginBottom: 32,
        }}>
          <StatusDot status="online" />
          <span style={{ fontSize: 12, color: "#00FF88", fontWeight: 700, letterSpacing: 0.5 }}>
            Available for new bookings
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fadeUp delay-1" style={{
          fontSize: "clamp(36px,8vw,72px)",
          fontWeight: 800, lineHeight: 1.05, color: "#E2F0F8", marginBottom: 8,
        }}>
          Your Systems,
        </h1>
        <h1 className="animate-fadeUp delay-2" style={{
          fontSize: "clamp(36px,8vw,72px)",
          fontWeight: 800, lineHeight: 1.05,
          background: "linear-gradient(135deg,#00D4FF,#00FF88)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 28,
        }}>
          Running Clean.
        </h1>

        <p className="animate-fadeUp delay-3" style={{
          fontSize: "clamp(15px,3vw,19px)",
          color: "#5A8FAA", lineHeight: 1.65,
          maxWidth: 520, margin: "0 auto 40px",
        }}>
          IT support that actually shows up. Transparent pricing, instant diagnostics,
          and deposit-confirmed bookings — no surprises.
        </p>

        {/* CTAs */}
        <div className="animate-fadeUp delay-4" style={{
          display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
        }}>
          <Button onClick={() => router.push("/triage")} variant="primary" size="lg">
            ⚡ Run Diagnostic
          </Button>
          <Button onClick={() => router.push("/book")} variant="secondary" size="lg">
            📅 Book a Slot
          </Button>
        </div>

        {/* Trust signals */}
        <div className="animate-fadeUp delay-5" style={{
          display: "flex", gap: 24, justifyContent: "center",
          marginTop: 48, flexWrap: "wrap",
        }}>
          {["100+ Jobs Done", "Same-Day Response", "MoMo Payments", "WhatsApp Updates"].map(t => (
            <div key={t} style={{
              fontSize: 12, color: "#2D5570",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: "#00D4FF" }}>✓</span> {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
