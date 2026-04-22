"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TRIAGE_TREE, URGENCY_CONFIG } from "@/utils/stateMachine";
import { Button } from "@/components/ui/primitives";

// ── Step Indicator ────────────────────────────────────────────
function StepIndicator({ pathLength, isTerminal }) {
  const steps  = ["Identify", "Diagnose", "Confirm", "Book"];
  const active = pathLength === 0 ? 0 : pathLength === 1 ? 1 : isTerminal ? 3 : 2;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: i < active ? "#00D4FF" : i === active
                ? "linear-gradient(135deg,#00D4FF,#006699)" : "#153042",
              color: i <= active ? "#040B0F" : "#2D5570",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
              boxShadow: i === active ? "0 0 16px #00D4FF88" : "none",
              transition: "all 0.3s",
            }}>
              {i < active ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 9, marginTop: 4, fontWeight: 700,
              letterSpacing: 0.5, textTransform: "uppercase",
              color: i <= active ? "#00D4FF" : "#2D5570",
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: 1, flex: 2, marginBottom: 20,
              background: i < active ? "#00D4FF" : "#153042",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────
function QuestionCard({ node, onSelect, pathLength }) {
  const [hovered, setHovered]   = useState(null);
  const [selected, setSelected] = useState(null);

  const handle = (opt) => {
    setSelected(opt.value);
    setTimeout(() => onSelect(opt), 280);
  };

  return (
    <div style={{ animation: "slideIn 0.35s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#00D4FF", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          Question {pathLength + 1}
        </span>
      </div>
      <h2 style={{ fontSize: "clamp(16px,4vw,21px)", fontWeight: 800, color: "#E2F0F8", marginBottom: 8, lineHeight: 1.3 }}>
        {node.question}
      </h2>
      {node.subtitle && (
        <p style={{ fontSize: 13, color: "#5A8FAA", marginBottom: 24, lineHeight: 1.55 }}>{node.subtitle}</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {node.options.map((opt, i) => {
          const isHov = hovered === opt.value;
          const isSel = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handle(opt)}
              onMouseEnter={() => setHovered(opt.value)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background:  isSel ? "rgba(0,212,255,0.14)" : isHov ? "rgba(0,212,255,0.07)" : "#0C1D27",
                border:      `1px solid ${isSel ? "#00D4FF" : isHov ? "#00D4FF55" : "#153042"}`,
                borderRadius: 10, padding: "13px 16px",
                color: "#E2F0F8", fontSize: 14, fontWeight: 500,
                textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.18s ease",
                transform: isSel ? "scale(0.98)" : isHov ? "translateX(5px)" : "none",
                boxShadow: isHov ? "0 0 18px rgba(0,212,255,0.15)" : "none",
                animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                fontFamily: "inherit",
              }}
            >
              <span style={{ flex: 1 }}>{opt.label}</span>
              <span style={{ color: isSel ? "#00D4FF" : "#2D5570", fontSize: 16, transition: "all 0.2s" }}>
                {isSel ? "●" : "›"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Diagnosis Result ──────────────────────────────────────────
function DiagnosisCard({ node, path, onBook, onRestart }) {
  const urg         = URGENCY_CONFIG[node.urgency] || URGENCY_CONFIG.MEDIUM;
  const pathSummary = path.map(p => p.selectedLabel).filter(Boolean).join(" → ");

  return (
    <div style={{ animation: "slideIn 0.4s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          ✓ Diagnosis Complete
        </span>
      </div>

      <div style={{
        display: "inline-flex", alignItems: "center",
        background: urg.bg, border: `1px solid ${urg.color}55`,
        borderRadius: 20, padding: "4px 14px", marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, color: urg.color, fontWeight: 700 }}>{urg.label}</span>
      </div>

      <div style={{
        background: "#0C1D27", border: "1px solid rgba(0,212,255,0.3)",
        borderRadius: 14, padding: 20, marginBottom: 14,
        boxShadow: "0 0 40px rgba(0,212,255,0.06)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{node.icon}</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#E2F0F8", marginBottom: 8 }}>{node.service}</h3>
        <p style={{ fontSize: 13, color: "#5A8FAA", lineHeight: 1.65, marginBottom: 20 }}>{node.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "Service Fee",   value: node.price,    color: "#00FF88" },
            { label: "Est. Duration", value: node.duration, color: "#00D4FF" },
            { label: "Deposit Due",   value: node.deposit,  color: "#FF6B35" },
          ].map(item => (
            <div key={item.label} style={{ background: "#081318", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 9, color: "#2D5570", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pathSummary && (
        <div style={{
          background: "rgba(0,212,255,0.04)", border: "1px solid #153042",
          borderRadius: 8, padding: "9px 14px", marginBottom: 18,
        }}>
          <span style={{ fontSize: 10, color: "#2D5570", textTransform: "uppercase", letterSpacing: 1 }}>Your answers: </span>
          <span style={{ fontSize: 12, color: "#5A8FAA" }}>{pathSummary}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button onClick={() => onBook(node)} variant="primary" size="lg" fullWidth>
          Book This Service — Pay {node.deposit} Deposit →
        </Button>
        <Button onClick={onRestart} variant="ghost" fullWidth>← Start Over</Button>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function TriageBot() {
  const router = useRouter();
  const [currentNodeId, setCurrentNodeId] = useState("START");
  const [path, setPath]   = useState([]);
  const [phase, setPhase] = useState("question");
  const topRef = useRef(null);

  const currentNode = TRIAGE_TREE[currentNodeId];
  const scrollUp    = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSelect = (option) => {
    const newPath = [...path, {
      nodeId: currentNodeId,
      selectedValue: option.value,
      selectedLabel: option.label.replace(/^[\p{Emoji}\s]+/u, "").trim(),
    }];
    setPath(newPath);
    const next = TRIAGE_TREE[option.next];
    if (!next) return;
    setCurrentNodeId(option.next);
    scrollUp();
    if (next.terminal) setPhase("result");
  };

  const handleBack = () => {
    if (path.length === 0) return;
    const newPath  = path.slice(0, -1);
    const prevId   = path[path.length - 1].nodeId;
    setCurrentNodeId(prevId);
    setPath(newPath);
    setPhase("question");
    scrollUp();
  };

  const handleRestart = () => {
    setCurrentNodeId("START");
    setPath([]);
    setPhase("question");
    scrollUp();
  };

  // Navigate to /book with triage results as query params
  const handleBook = (node) => {
    const params = new URLSearchParams({
      service:        node.service,
      icon:           node.icon,
      price:          node.price,
      deposit:        node.deposit,
      urgency:        node.urgency,
      duration:       node.duration,
      diagnosticPath: JSON.stringify(path),
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div ref={topRef} style={{ padding: "0 0 40px" }}>
      {/* Sticky bot header */}
      <div style={{
        background: "rgba(8,19,24,0.9)", borderBottom: "1px solid #153042",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 64, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg,#00D4FF,#006699)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#E2F0F8" }}>Diagnostic Triage Bot</div>
            <div style={{
              fontSize: 10, color: "#00D4FF", animation: "pulse 2s infinite",
              fontFamily: "var(--font-mono, monospace)",
            }}>● LIVE SESSION</div>
          </div>
        </div>
        {path.length > 0 && phase !== "result" && (
          <button
            onClick={handleBack}
            style={{
              background: "transparent", border: "1px solid #153042",
              borderRadius: 7, padding: "6px 14px",
              color: "#5A8FAA", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >← Back</button>
        )}
      </div>

      {/* Card */}
      <div style={{ maxWidth: 560, margin: "32px auto 0", padding: "0 16px" }}>
        <div style={{
          background: "#081318", border: "1px solid #153042",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.06)",
        }}>
          <div style={{ padding: "24px 24px 0" }}>
            <StepIndicator pathLength={path.length} isTerminal={currentNode?.terminal} />
          </div>
          <div style={{ padding: "0 24px 28px" }}>
            {phase === "question" && currentNode && !currentNode.terminal
              ? <QuestionCard node={currentNode} onSelect={handleSelect} pathLength={path.length} />
              : <DiagnosisCard node={currentNode} path={path} onBook={handleBook} onRestart={handleRestart} />
            }
          </div>
          <div style={{
            borderTop: "1px solid #153042", padding: "11px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 10, color: "#2D5570", fontFamily: "var(--font-mono, monospace)" }}>
              DIGITAL SERVICE BAY
            </span>
            <span style={{ fontSize: 10, color: "#2D5570" }}>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
