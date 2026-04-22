"use client";

// components/ui/primitives.jsx

// ── Button ───────────────────────────────────────────────────
export function Button({
  children, onClick, variant = "primary",
  size = "md", disabled = false, fullWidth = false, style = {}
}) {
  const base = {
    fontFamily: "inherit", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: 10,
    transition: "all 0.2s ease",
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 8,
  };
  const sizes = {
    sm: { padding: "8px 16px",  fontSize: 12 },
    md: { padding: "12px 22px", fontSize: 14 },
    lg: { padding: "16px 28px", fontSize: 16 },
  };
  const variants = {
    primary:   { background: "linear-gradient(135deg,#00D4FF,#006699)", color: "#040B0F", boxShadow: "0 4px 20px rgba(0,212,255,0.3)" },
    secondary: { background: "transparent", color: "#00D4FF", border: "1px solid #00D4FF" },
    ghost:     { background: "transparent", color: "#5A8FAA", border: "1px solid #153042" },
    danger:    { background: "linear-gradient(135deg,#FF3366,#AA0033)", color: "#fff" },
    green:     { background: "linear-gradient(135deg,#00FF88,#00AA55)", color: "#040B0F" },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = "#00D4FF", bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg || `${color}18`,
      border: `1px solid ${color}44`,
      color, borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    }}>
      {children}
    </span>
  );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 20, color = "#00D4FF" }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── StatusDot ────────────────────────────────────────────────
export function StatusDot({ status = "online" }) {
  const colors = { online: "#00FF88", busy: "#FF6B35", offline: "#5A8FAA" };
  const color  = colors[status] || colors.offline;
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: "absolute", inset: 0,
        background: color, borderRadius: "50%",
        animation: status === "online" ? "pulse 2s infinite" : "none",
        opacity: 0.4,
      }} />
      <span style={{ position: "absolute", inset: "2px", background: color, borderRadius: "50%" }} />
    </span>
  );
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(4,11,15,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#081318", border: "1px solid #153042",
          borderRadius: 20, width: "100%", maxWidth: 520,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "fadeUp 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #153042",
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#E2F0F8" }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid #153042",
              borderRadius: 8, width: 30, height: 30,
              color: "#5A8FAA", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}
          >×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
