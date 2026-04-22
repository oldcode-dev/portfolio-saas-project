"use client";

export default function SiteFooter() {
  return (
    <footer style={{
      borderTop: "1px solid #153042",
      padding: "32px 20px",
      textAlign: "center",
      maxWidth: 1100, margin: "0 auto",
    }}>
      <div style={{ fontSize: 13, color: "#2D5570", lineHeight: 2 }}>
        <span style={{ color: "#00D4FF", fontWeight: 700 }}>Digital Service Bay</span>
        {" · "}Kumasi, Ghana{" · "}
        <a href="https://wa.me/233XXXXXXXX" style={{ color: "#00FF88" }}>WhatsApp</a>
        {" · "}
        <a href="mailto:hello@servicebay.io" style={{ color: "#5A8FAA" }}>
          hello@servicebay.io
        </a>
      </div>
      <div style={{
        fontSize: 11, color: "#153042", marginTop: 8,
        fontFamily: "var(--font-mono, monospace)",
      }}>
        © {new Date().getFullYear()} Digital Service Bay · Built with Next.js + Supabase
      </div>
    </footer>
  );
}
