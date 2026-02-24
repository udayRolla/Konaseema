import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://eoeoaifreavxejmahwvy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "YOUR_ANON_KEY";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,

    // 🔥 CRITICAL FIXES
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: "pkce",

    storageKey: "sb-auth", // prevent lock conflict
  },
});
