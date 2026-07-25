import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Speak to Me runs on the shared Life Produces Life (LPL) Supabase project.
 * Journals live in stm_journal_entries (RLS: auth_user_id = auth.uid()).
 * Shared identity links to lpl_people so a person is one person across the
 * whole ecosystem. Do not provision a separate database for this app.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null | undefined;

export function createSpeakClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  if (browserClient === undefined) {
    browserClient = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon);
}
