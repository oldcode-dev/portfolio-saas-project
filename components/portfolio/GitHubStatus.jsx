"use client";

// GitHubStatus receives `repos` and `profile` as props — already fetched
// server-side in app/page.jsx via lib/github.js with ISR caching.
// No client-side fetch needed here.

import { useState } from "react";
import Image from "next/image";

const LANG_COLORS = {
  Python: "#3776AB", JavaScript: "#F7DF1E", TypeScript: "#3178C6",
  Go: "#00ADD8", PowerShell: "#5391FE", YAML: "#CB171E",
  Rust: "#DEA584", "N/A": "#5A8FAA",
};

function TimeAgo({ dateStr }) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return <span>Today</span>;
  if (days === 1) return <span>Yesterday</span>;
  if (days < 7)  return <span>{days}d ago</span>;
  if (days < 30) return <span>{Math.floor(days / 7)}w ago</span>;
  return <span>{Math.floor(days / 30)}mo ago</span>;
}

export default function GitHubStatus({ repos = [], profile = null }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 32, flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{
            fontSize: 11, color: "#00FF88", fontWeight: 700,
            letterSpacing: 3, textTransform: "uppercase", marginBottom: 8,
            fontFamily: "var(--font-mono, monospace)",
          }}>── Live GitHub Status ──</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#E2F0F8" }}>
            What I&apos;m Building
          </h2>
        </div>

        {profile && (
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#0C1D27", border: "1px solid #153042",
              borderRadius: 50, padding: "8px 16px 8px 8px",
              textDecoration: "none",
            }}
          >
            <Image
              src={profile.avatar_url}
              alt="GitHub avatar"
              width={34} height={34}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2F0F8" }}>@{profile.login}</div>
              <div style={{ fontSize: 11, color: "#5A8FAA" }}>
                {profile.followers} followers · {profile.public_repos} repos
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Repos grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
        gap: 14,
      }}>
        {repos.map((repo, i) => {
          const isHov     = hovered === repo.id;
          const langColor = LANG_COLORS[repo.language] || "#5A8FAA";
          return (
            <a
              key={repo.id}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setHovered(repo.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? "#0C1D27" : "#081318",
                border: `1px solid ${isHov ? "#00FF8855" : "#153042"}`,
                borderRadius: 14, padding: 18,
                textDecoration: "none",
                display: "flex", flexDirection: "column", gap: 10,
                transition: "all 0.2s",
                transform: isHov ? "translateY(-2px)" : "none",
                boxShadow: isHov ? "0 8px 30px rgba(0,255,136,0.08)" : "none",
                animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#00D4FF", lineHeight: 1.2 }}>
                  {repo.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: langColor }} />
                  <span style={{ fontSize: 11, color: "#5A8FAA" }}>{repo.language}</span>
                </div>
              </div>

              <p style={{ fontSize: 12, color: "#5A8FAA", lineHeight: 1.55, flex: 1, margin: 0 }}>
                {repo.description}
              </p>

              {repo.topics.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {repo.topics.slice(0, 3).map(t => (
                    <span key={t} style={{
                      background: "rgba(0,212,255,0.08)", border: "1px solid #153042",
                      borderRadius: 4, padding: "2px 7px",
                      fontSize: 10, color: "#5A8FAA",
                    }}>{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "#5A8FAA" }}>⭐ {repo.stars}</span>
                  <span style={{ fontSize: 11, color: "#5A8FAA" }}>🍴 {repo.forks}</span>
                </div>
                <span style={{ fontSize: 11, color: "#2D5570" }}>
                  <TimeAgo dateStr={repo.updatedAt} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
