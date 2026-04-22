"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui/primitives";

const SERVICES = [
  { id: "os-install",    icon: "💿", category: "Software",  name: "OS Installation",         desc: "Clean Windows/Linux install with driver pack and essential software. Includes data backup.",           price: "₦8,000",        duration: "2–3 hrs",  deposit: "₦3,500", urgency: "MEDIUM", popular: true  },
  { id: "networking",    icon: "📡", category: "Network",   name: "Network Setup & Config",   desc: "Full router setup, Wi-Fi optimisation, firewall rules, and cable routing.",                          price: "₦18,000",       duration: "Half day", deposit: "₦7,000", urgency: "LOW",    popular: false },
  { id: "malware",       icon: "🛡️", category: "Security",  name: "Malware Removal",          desc: "Full system scan, adware removal, browser reset, AV install and hardening.",                       price: "₦6,000",        duration: "2 hrs",    deposit: "₦3,000", urgency: "HIGH",   popular: true  },
  { id: "upgrade",       icon: "🚀", category: "Hardware",  name: "RAM / SSD Upgrade",        desc: "Source and install RAM or SSD upgrades. Performance benchmark before and after.",                   price: "₦6,000",        duration: "2 hrs",    deposit: "₦2,500", urgency: "LOW",    popular: false },
  { id: "data-recovery", icon: "💾", category: "Data",      name: "Data Recovery",            desc: "Recover files from failed HDDs, accidentally deleted partitions, or corrupted drives.",             price: "From ₦12,000",  duration: "24–72 hrs",deposit: "₦5,000", urgency: "HIGH",   popular: false },
  { id: "thermal",       icon: "❄️", category: "Hardware",  name: "Thermal Cleaning",         desc: "Deep clean, compressed-air dust extraction, fresh thermal paste, fan speed optimisation.",         price: "₦5,000",        duration: "1 hr",     deposit: "₦2,000", urgency: "MEDIUM", popular: false },
  { id: "security-audit",icon: "🔍", category: "Security",  name: "Security Audit",           desc: "Password hygiene check, browser extensions audit, privacy settings, VPN setup.",                   price: "₦7,000",        duration: "2 hrs",    deposit: "₦3,000", urgency: "LOW",    popular: false },
  { id: "remote",        icon: "🖥️", category: "Remote",   name: "Remote Support",           desc: "Screen-share assisted troubleshooting for software issues. No travel required.",                   price: "₦3,000/hr",     duration: "1 hr min", deposit: "₦3,000", urgency: "MEDIUM", popular: true  },
  { id: "custom",        icon: "🏗️", category: "Custom",   name: "Custom IT Project",        desc: "Homelab builds, server configs, dev environments. We scope and quote after consult.",              price: "Quote on Request",duration: "TBD",    deposit: "₦5,000", urgency: "LOW",    popular: false },
];

const CATEGORIES = ["All", "Hardware", "Software", "Network", "Security", "Remote", "Data", "Custom"];

const CAT_COLORS = {
  Hardware: "#FF6B35", Software: "#00D4FF", Network: "#00FF88",
  Security: "#FF3366", Remote: "#FFB800",  Data: "#A855F7", Custom: "#5A8FAA",
};

export default function ServiceGrid() {
  const router   = useRouter();
  const [cat, setCat]     = useState("All");
  const [hovered, setHovered] = useState(null);

  const filtered = cat === "All" ? SERVICES : SERVICES.filter(s => s.category === cat);

  const handleBook = (svc) => {
    const params = new URLSearchParams({
      service:  svc.name,
      icon:     svc.icon,
      price:    svc.price,
      deposit:  svc.deposit,
      urgency:  svc.urgency,
      duration: svc.duration,
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{
          fontSize: 11, color: "#00D4FF", fontWeight: 700,
          letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
          fontFamily: "var(--font-mono, monospace)",
        }}>── Services ──</div>
        <h2 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, color: "#E2F0F8", marginBottom: 14 }}>
          What can I fix for you?
        </h2>
        <p style={{ fontSize: 15, color: "#5A8FAA", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          Transparent pricing. No surprises. Every job comes with a diagnostic summary.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              background: cat === c ? "#00D4FF" : "transparent",
              border: `1px solid ${cat === c ? "#00D4FF" : "#153042"}`,
              borderRadius: 20, padding: "6px 16px",
              color: cat === c ? "#040B0F" : "#5A8FAA",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}
          >{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}>
        {filtered.map((svc, i) => {
          const isHov     = hovered === svc.id;
          const catColor  = CAT_COLORS[svc.category] || "#5A8FAA";
          return (
            <div
              key={svc.id}
              onMouseEnter={() => setHovered(svc.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? "#0C1D27" : "#081318",
                border: `1px solid ${isHov ? `${catColor}55` : "#153042"}`,
                borderRadius: 16, padding: 22, position: "relative",
                transition: "all 0.22s ease",
                transform: isHov ? "translateY(-3px)" : "none",
                boxShadow: isHov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${catColor}11` : "none",
                animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
              }}
            >
              {svc.popular && (
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "rgba(0,255,136,0.12)", border: "1px solid #00FF8855",
                  borderRadius: 20, padding: "2px 10px",
                  fontSize: 10, color: "#00FF88", fontWeight: 700,
                }}>★ Popular</div>
              )}
              <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon}</div>
              <div style={{ marginBottom: 6 }}>
                <Badge color={catColor}>{svc.category}</Badge>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#E2F0F8", margin: "8px 0" }}>{svc.name}</h3>
              <p style={{ fontSize: 13, color: "#5A8FAA", lineHeight: 1.6, marginBottom: 18, minHeight: 52 }}>
                {svc.desc}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#00FF88" }}>{svc.price}</div>
                  <div style={{ fontSize: 10, color: "#2D5570", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {svc.duration}
                  </div>
                </div>
              </div>
              <Button onClick={() => handleBook(svc)} variant="secondary" fullWidth size="sm">
                Book Now →
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
