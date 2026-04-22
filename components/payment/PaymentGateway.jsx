"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui/primitives";

function generateRef(prefix = "DSB") {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function nairaToKobo(str) {
  const clean = String(str).replace(/[₦,\s]/g, "");
  const n     = parseFloat(clean);
  return isNaN(n) ? 0 : Math.round(n * 100);
}

export default function PaymentGateway({ booking, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const { service, clientDetails, slot } = booking;

  const handlePayNow = () => {
    if (!window.PaystackPop) {
      setError("Payment SDK not loaded. Please refresh and try again.");
      return;
    }
    setError(null);
    setLoading(true);

    const reference  = generateRef();
    const amountKobo = nairaToKobo(service.deposit);

    const handler = window.PaystackPop.setup({
      key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:    clientDetails.email || `${clientDetails.phone.replace(/\D/g,"")}@dsb.local`,
      amount:   amountKobo,
      ref:      reference,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Client Name",  variable_name: "client_name",  value: clientDetails.name  },
          { display_name: "Phone Number", variable_name: "phone_number", value: clientDetails.phone },
        ],
      },
      callback: (response) => {
        setLoading(false);
        onSuccess?.({ reference: response.reference || reference, transactionId: response.transaction, amountKobo });
      },
      onClose: () => {
        setLoading(false);
        setError("Payment window closed. Click 'Pay Now' to try again.");
      },
    });
    handler.openIframe();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{ background: "#081318", border: "1px solid #153042", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#5A8FAA", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
          Booking Summary
        </div>
        {[
          { label: "Service",   value: service.service || service.name },
          { label: "Client",    value: clientDetails.name              },
          { label: "Phone",     value: clientDetails.phone             },
          { label: "Location",  value: clientDetails.location          },
          { label: "Time Slot", value: slot?.display || "Not selected" },
        ].map(row => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "8px 0", borderBottom: "1px solid #0C1D27",
          }}>
            <span style={{ fontSize: 12, color: "#5A8FAA" }}>{row.label}</span>
            <span style={{ fontSize: 13, color: "#E2F0F8", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>
              {row.value}
            </span>
          </div>
        ))}

        <div style={{
          marginTop: 16, background: "rgba(0,255,136,0.06)",
          border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#5A8FAA", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Deposit Due Now
            </div>
            <div style={{ fontSize: 10, color: "#2D5570", marginTop: 2 }}>Full fee: {service.price}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#00FF88" }}>{service.deposit}</div>
        </div>
      </div>

      {/* Payment method pills */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#2D5570", marginBottom: 10 }}>PAY VIA</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {["📱 Mobile Money", "💳 Card", "🏦 Bank Transfer"].map(m => (
            <span key={m} style={{
              background: "#0C1D27", border: "1px solid #153042",
              borderRadius: 6, padding: "4px 12px",
              fontSize: 12, color: "#5A8FAA",
            }}>{m}</span>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(255,51,102,0.08)", border: "1px solid #FF336633",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FF3366",
        }}>⚠ {error}</div>
      )}

      <Button onClick={handlePayNow} variant="green" size="lg" fullWidth disabled={loading}>
        {loading
          ? <><Spinner size={16} color="#040B0F" /> Connecting to Paystack…</>
          : `Pay ${service.deposit} Securely →`
        }
      </Button>

      <button
        onClick={onCancel}
        style={{
          background: "none", border: "none", color: "#5A8FAA",
          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}
      >← Go back and edit details</button>

      <p style={{ fontSize: 10, color: "#2D5570", textAlign: "center", lineHeight: 1.6 }}>
        Secured by Paystack · 256-bit SSL · Deposit is non-refundable within 24hrs of appointment
      </p>
    </div>
  );
}
