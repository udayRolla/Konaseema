import { createClient } from "@supabase/supabase-js";

// fallback (your current project)
const FALLBACK_SUPABASE_URL = "https://eoeoaifreavxejmahwvy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW9haWZyZWF2eGVqbWFod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDg5NDMsImV4cCI6MjA4NTAyNDk0M30.MAhak45Pv-zAXFkx3LTRHk8i45iaK9axyyN4KQ0laHo";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
