// app/page.jsx — Server Component (no "use client")
// Static metadata + async data fetching happen here at the server level.
// Interactive child components are Client Components marked "use client".

import { Suspense } from "react";
import HeroSection from "@/components/portfolio/HeroSection";
import ServiceGrid from "@/components/portfolio/ServiceGrid";
import GitHubStatus from "@/components/portfolio/GitHubStatus";
import SiteFooter from "@/components/ui/SiteFooter";
import { fetchRepos, fetchProfile } from "@/lib/github";

// Next.js will cache this fetch and revalidate every 5 minutes
async function getGitHubData() {
  try {
    const [repos, profile] = await Promise.all([fetchRepos(6), fetchProfile()]);
    return { repos, profile };
  } catch {
    return { repos: [], profile: null };
  }
}

export default async function HomePage() {
  const { repos, profile } = await getGitHubData();

  return (
    <>
      <HeroSection />

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#153042,transparent)", maxWidth: 1100, margin: "0 auto" }} />

      <Suspense fallback={<ServiceGridSkeleton />}>
        <ServiceGrid />
      </Suspense>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#153042,transparent)", maxWidth: 1100, margin: "0 auto" }} />

      {/* GitHub data fetched server-side, passed as props */}
      <GitHubStatus repos={repos} profile={profile} />

      <SiteFooter />
    </>
  );
}

function ServiceGridSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 220, background: "#081318", borderRadius: 16, border: "1px solid #153042", opacity: 0.5 }} />
        ))}
      </div>
    </div>
  );
}
