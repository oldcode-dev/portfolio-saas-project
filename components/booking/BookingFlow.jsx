"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingCalendar from "./BookingCalendar";
import BookingForm from "./BookingForm";
import PaymentGateway from "@/components/payment/PaymentGateway";

const STEPS = ["Select Slot", "Your Details", "Payment", "Confirmed"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < current ? "#00D4FF"
                : i === current ? "linear-gradient(135deg,#00D4FF,#006699)" : "#153042",
              color: i <= current ? "#040B0F" : "#2D5570",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800,
              boxShadow: i === current ? "0 0 20px rgba(0,212,255,0.5)" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 10, marginTop: 5, textTransform: "uppercase",
              letterSpacing: 0.4, fontWeight: 700,
              color: i <= current ? "#00D4FF" : "#2D5570",
            }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              height: 1, flex: 2, marginBottom: 20,
              background: i < current ? "#00D4FF" : "#153042",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ConfirmationScreen({ service, slot, paymentRef }) {
  const router = useRouter();
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: "#00FF88", marginBottom: 12 }}>Booking Confirmed!</h2>
      <p style={{ fontSize: 15, color: "#5A8FAA", marginBottom: 24, lineHeight: 1.6 }}>
        Your deposit was received. You&apos;ll get an SMS confirmation shortly, and your tech will be in touch before the appointment.
      </p>
      <div style={{ background: "#081318", border: "1px solid #153042", borderRadius: 14, padding: 20, marginBottom: 28, textAlign: "left" }}>
        {[
          { label: "Service",   value: service },
          { label: "Slot",      value: slot?.display },
          { label: "Reference", value: paymentRef },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0C1D27" }}>
            <span style={{ fontSize: 12, color: "#5A8FAA" }}>{r.label}</span>
            <span style={{
              fontSize: 13, color: "#E2F0F8", fontWeight: 600,
              fontFamily: r.label === "Reference" ? "var(--font-mono, monospace)" : "inherit",
            }}>{r.value || "—"}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => router.push("/")}
        style={{
          background: "linear-gradient(135deg,#00D4FF,#006699)",
          border: "none", borderRadius: 10, padding: "14px 28px",
          color: "#040B0F", fontSize: 15, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >Back to Home →</button>
    </div>
  );
}

export default function BookingFlow({ preselect }) {
  const searchParams = useSearchParams();
  const [step, setStep]       = useState(0);
  const [slot, setSlot]       = useState(null);
  const [details, setDetails] = useState(null);
  const [paymentRef, setRef]  = useState(null);
  const [loading, setLoading] = useState(false);

  // Service can come from props (server) or URL params (client)
  const service = preselect || {
    service:  searchParams.get("service")  || null,
    icon:     searchParams.get("icon")     || "🔧",
    price:    searchParams.get("price")    || null,
    deposit:  searchParams.get("deposit")  || "₦2,000",
    urgency:  searchParams.get("urgency")  || "MEDIUM",
    duration: searchParams.get("duration") || null,
  };

  // Parse diagnosticPath if it came from triage
  let diagnosticPath = null;
  try {
    const raw = searchParams.get("diagnosticPath");
    if (raw) diagnosticPath = JSON.parse(raw);
  } catch {}

  const handlePaymentSuccess = async (payResult) => {
    setLoading(true);
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName:     details.name,
          clientPhone:    details.phone,
          clientEmail:    details.email || null,
          clientLocation: details.location,
          serviceName:    service.service || "General Service",
          servicePrice:   service.price,
          depositAmount:  payResult.amountKobo,
          urgency:        service.urgency || "MEDIUM",
          diagnosticPath,
          slotDatetime:   `${slot.date}T${slot.time}:00`,
          paymentRef:     payResult.reference,
          notes:          details.notes || null,
        }),
      });
    } catch (err) {
      console.error("[BookingFlow] POST /api/bookings failed:", err);
    } finally {
      setRef(payResult.reference);
      setStep(3);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 16px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 11, color: "#00D4FF", fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase", marginBottom: 8,
          fontFamily: "var(--font-mono, monospace)",
        }}>── Booking ──</div>
        <h1 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: 800, color: "#E2F0F8" }}>
          {step === 3 ? "All Done!" : "Reserve Your Slot"}
        </h1>
        {service.service && step < 3 && (
          <div style={{
            marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,212,255,0.08)", border: "1px solid #153042",
            borderRadius: 8, padding: "6px 12px",
          }}>
            <span style={{ fontSize: 16 }}>{service.icon}</span>
            <span style={{ fontSize: 13, color: "#00D4FF", fontWeight: 600 }}>{service.service}</span>
          </div>
        )}
      </div>

      <StepBar current={step} />

      <div style={{
        background: "#081318", border: "1px solid #153042",
        borderRadius: 20, padding: "28px 24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        {step === 0 && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#E2F0F8", marginBottom: 20 }}>
              Pick an available date & time
            </h3>
            <BookingCalendar onSlotSelected={setSlot} />
            {slot && (
              <button
                onClick={() => setStep(1)}
                style={{
                  marginTop: 24, width: "100%",
                  background: "linear-gradient(135deg,#00D4FF,#006699)",
                  border: "none", borderRadius: 10, padding: "14px",
                  color: "#040B0F", fontSize: 15, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >Continue with {slot.display} →</button>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#E2F0F8" }}>Your Details</h3>
              <button
                onClick={() => setStep(0)}
                style={{ background: "none", border: "none", color: "#5A8FAA", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >← Change slot</button>
            </div>
            <BookingForm onSubmit={(d) => { setDetails(d); setStep(2); }} loading={loading} />
          </>
        )}

        {step === 2 && details && (
          <PaymentGateway
            booking={{ service, clientDetails: details, slot }}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ConfirmationScreen
            service={service.service}
            slot={slot}
            paymentRef={paymentRef}
          />
        )}
      </div>
    </div>
  );
}
