"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StatusDot } from "./primitives";

const NAV_LINKS = [
  { href: "/",          label: "Home"    },
  { href: "/triage",    label: "Diagnose"},
  { href: "/book",      label: "Book"    },
  { href: "/dashboard", label: "Ops Hub" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      background: "rgba(4,11,15,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #153042",
      height: 64,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "100%", padding: "0 20px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg,#00D4FF,#006699)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#E2F0F8", lineHeight: 1 }}>
              Service Bay
            </div>
            <div style={{
              fontSize: 9, color: "#00D4FF", letterSpacing: 2,
              fontFamily: "var(--font-mono, monospace)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <StatusDot status="online" /> ONLINE
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  background: isActive ? "rgba(0,212,255,0.12)" : "transparent",
                  border: `1px solid ${isActive ? "#00D4FF66" : "transparent"}`,
                  borderRadius: 8, padding: "7px 16px",
                  color: isActive ? "#00D4FF" : "#5A8FAA",
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  display: "inline-block",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/triage"
          style={{
            background: "linear-gradient(135deg,#00D4FF,#006699)",
            borderRadius: 9, padding: "9px 18px",
            color: "#040B0F", fontSize: 13, fontWeight: 800,
            textDecoration: "none", whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          Start Triage →
        </Link>
      </div>
    </header>
  );
}
