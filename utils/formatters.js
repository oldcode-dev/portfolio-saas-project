// utils/formatters.js — shared pure utilities (no "use client" needed)

export function formatCurrency(amountInSmallUnit, symbol = "₦") {
  return `${symbol}${(amountInSmallUnit / 100).toLocaleString("en-GH", { minimumFractionDigits: 0 })}`;
}

export function formatDateTime(isoString, opts = { dateStyle: "medium", timeStyle: "short" }) {
  return new Date(isoString).toLocaleString("en-GH", { ...opts, timeZone: "Africa/Accra" });
}

export function timeAgo(date) {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function normalizePhone(raw, prefix = "+233") {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233") || digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `${prefix}${digits.slice(1)}`;
  return `${prefix}${digits}`;
}

export function generateRef(prefix = "DSB") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;
}

export function nairaToKobo(str) {
  const n = parseFloat(String(str).replace(/[₦,\s]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

export function truncate(str, max = 80) {
  return str && str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}
