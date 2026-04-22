// lib/github.js
// Used in Server Components (app/page.jsx) — benefits from Next.js fetch cache

const USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "your-username";
const TOKEN    = process.env.GITHUB_TOKEN || "";

const headers = {
  Accept: "application/vnd.github+json",
  ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
};

export async function fetchRepos(limit = 6) {
  try {
    // next: { revalidate: 300 } — cache for 5 min server-side
    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=${limit}&type=public`,
      { headers, next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const repos = await res.json();
    return repos.map(r => ({
      id:          r.id,
      name:        r.name,
      description: r.description || "No description",
      url:         r.html_url,
      language:    r.language || "N/A",
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      updatedAt:   r.pushed_at,
      topics:      r.topics || [],
    }));
  } catch (err) {
    console.error("[GitHub fetchRepos]", err.message);
    return MOCK_REPOS;
  }
}

export async function fetchProfile() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${USERNAME}`,
      { headers, next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[GitHub fetchProfile]", err.message);
    return null;
  }
}

// Mock fallback data
const MOCK_REPOS = [
  { id:1, name:"network-monitor",    description:"Real-time LAN monitoring dashboard",         url:"#", language:"Python",     stars:12, forks:3,  updatedAt:new Date().toISOString(), topics:["networking","python","dashboard"] },
  { id:2, name:"win-deploy-toolkit", description:"Automated Windows OS deployment scripts",     url:"#", language:"PowerShell", stars:8,  forks:2,  updatedAt:new Date().toISOString(), topics:["windows","automation","sysadmin"] },
  { id:3, name:"secure-audit-cli",   description:"Security audit tool for SME environments",    url:"#", language:"Go",         stars:21, forks:5,  updatedAt:new Date().toISOString(), topics:["security","cli","go"] },
  { id:4, name:"momo-pay-sdk",       description:"Mobile Money integration helpers for Node",   url:"#", language:"JavaScript", stars:35, forks:11, updatedAt:new Date().toISOString(), topics:["fintech","nodejs","ghana"] },
  { id:5, name:"homelab-configs",    description:"Ansible playbooks for homelab setup",         url:"#", language:"YAML",       stars:6,  forks:1,  updatedAt:new Date().toISOString(), topics:["ansible","homelab","devops"] },
  { id:6, name:"it-ticket-bot",      description:"WhatsApp bot for IT helpdesk triage",         url:"#", language:"TypeScript", stars:18, forks:4,  updatedAt:new Date().toISOString(), topics:["twilio","whatsapp","bot"] },
];
