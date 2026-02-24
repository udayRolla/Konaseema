import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://eoeoaifreavxejmahwvy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW9haWZyZWF2eGVqbWFod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDg5NDMsImV4cCI6MjA4NTAyNDk0M30.MAhak45Pv-zAXFkx3LTRHk8i45iaK9axyyN4KQ0laHo";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY;

/**
 * CRITICAL FIX:
 * - Disable auto refresh
 * - Disable session detection
 * - Avoid LockManager usage
 */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "konaseema-auth", // custom key prevents conflict
  },
  global: {
    headers: {
      "X-Client-Info": "konaseema-foods",
    },
  },
});
