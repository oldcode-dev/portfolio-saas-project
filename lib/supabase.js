// lib/supabase.js
// Two separate clients:
//   browserClient() — uses anon key, safe for client components
//   serverClient()  — uses service role key, server only (API routes, Server Components)

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser client (singleton) — used in Client Components + hooks
let _browserClient = null;
export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _browserClient;
}

// Convenience alias
export const supabase = {
  get auth() { return getBrowserClient().auth; },
  from: (...args) => getBrowserClient().from(...args),
  channel: (...args) => getBrowserClient().channel(...args),
  removeChannel: (...args) => getBrowserClient().removeChannel(...args),
};

// Auth helpers
export const signInAdmin = (email, password) =>
  getBrowserClient().auth.signInWithPassword({ email, password });

export const signOut = () => getBrowserClient().auth.signOut();

export const getSession = () => getBrowserClient().auth.getSession();
