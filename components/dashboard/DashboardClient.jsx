"use client";

import { useState, useEffect } from "react";
import OpsHub from "./OpsHub";
import { getBrowserClient, signInAdmin, signOut } from "@/lib/supabase";
import { Button, Spinner } from "@/components/ui/primitives";

function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Both fields required."); return; }
    setLoading(true); setError(null);
    try {
      const { error: authErr } = await signInAdmin(email, password);
      if (authErr) throw authErr;
      onLogin();
    } catch (e) {
      setError(e.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "#081318", border: "1px solid #153042",
        borderRadius: 20, padding: 32,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg,#00D4FF,#006699)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 16px",
          }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#E2F0F8" }}>Admin Access</h2>
          <p style={{ fontSize: 13, color: "#5A8FAA", marginTop: 6 }}>Ops Hub is restricted to admin only</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#5A8FAA", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} placeholder="admin@servicebay.io"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#5A8FAA", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,51,102,0.08)", border: "1px solid #FF336633",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FF3366",
            }}>⚠ {error}</div>
          )}

          <Button onClick={handleLogin} variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? <><Spinner size={14} color="#040B0F" /> Authenticating…</> : "Sign In →"}
          </Button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#2D5570", marginBottom: 8 }}>— or —</div>
            <button
              onClick={onLogin}
              style={{
                background: "transparent", border: "1px solid #153042",
                borderRadius: 8, padding: "9px 20px",
                color: "#5A8FAA", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", width: "100%",
              }}
            >👁 Preview Dashboard (Demo Mode)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession()
      .then(({ data }) => { if (data?.session) setAuthed(true); })
      .catch(() => {})
      .finally(() => setChecking(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) => {
      setAuthed(!!session);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setAuthed(false);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <>
      <div style={{
        background: "rgba(8,19,24,0.95)", borderBottom: "1px solid #153042",
        padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 64, zIndex: 10,
      }}>
        <span style={{ fontSize: 12, color: "#00D4FF", fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>
          ● ADMIN SESSION ACTIVE
        </span>
        <button
          onClick={handleSignOut}
          style={{
            background: "transparent", border: "1px solid #FF336644",
            borderRadius: 7, padding: "5px 14px",
            color: "#FF3366", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >Sign Out</button>
      </div>
      <OpsHub />
    </>
  );
}

const inputStyle = {
  width: "100%", background: "#040B0F",
  border: "1px solid #153042", borderRadius: 10,
  padding: "12px 14px", color: "#E2F0F8",
  fontSize: 14, fontFamily: "inherit", outline: "none",
};
