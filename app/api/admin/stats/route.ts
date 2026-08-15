import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OWNER_FALLBACK = "lincoln@unitedundergod.org";

function ownerEmails(): string[] {
  const listed = (process.env.APP_ENGINE_OWNER_EMAIL || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!listed.includes(OWNER_FALLBACK)) listed.push(OWNER_FALLBACK);
  return listed;
}

function isOwnerEmail(email?: string | null): boolean {
  const n = (email || "").trim().toLowerCase();
  return Boolean(n && ownerEmails().includes(n));
}

function tokenMatches(presented: string, expected: string): boolean {
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function userFromJwt(token: string): Promise<{ email?: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { email?: string };
}

async function authorize(request: Request): Promise<{ ok: boolean; status: number; message: string }> {
  const expected = (process.env.APP_ENGINE_STATS_TOKEN || "").trim();
  const header = request.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (expected && presented && tokenMatches(presented, expected)) {
    return { ok: true, status: 200, message: "" };
  }
  if (presented) {
    const user = await userFromJwt(presented);
    if (user && isOwnerEmail(user.email)) return { ok: true, status: 200, message: "" };
    if (user) return { ok: false, status: 403, message: "This dashboard is for the owner." };
  }
  return { ok: false, status: 401, message: "A valid stats token is required." };
}

async function countRows(
  sb: SupabaseClient,
  table: string,
  opts?: { gte?: [string, string]; lt?: [string, string] }
): Promise<number | null> {
  try {
    let q = sb.from(table).select("*", { count: "exact", head: true });
    if (opts?.gte) q = q.gte(opts.gte[0], opts.gte[1]);
    if (opts?.lt) q = q.lt(opts.lt[0], opts.lt[1]);
    const { count, error } = await q;
    if (error) return null;
    return typeof count === "number" ? count : 0;
  } catch {
    return null;
  }
}

async function distinctCount(
  sb: SupabaseClient,
  table: string,
  column: string,
  opts?: { gte?: [string, string]; lt?: [string, string] }
): Promise<number | null> {
  try {
    let q = sb.from(table).select(column);
    if (opts?.gte) q = q.gte(opts.gte[0], opts.gte[1]);
    if (opts?.lt) q = q.lt(opts.lt[0], opts.lt[1]);
    const { data, error } = await q;
    if (error || !Array.isArray(data)) return null;
    const ids = new Set(
      data
        .map((row) => (row as unknown as Record<string, unknown>)[column])
        .filter(Boolean)
    );
    return ids.size;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const gate = await authorize(request);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
  }

  const sb = createAdminClient();
  if (!sb) {
    return NextResponse.json({
      ok: true,
      reporting: false,
      users: null,
      ticketsOpen: null,
      ordersRecent: null,
      activeUsers30d: null,
      newUsers7d: null,
      newUsersPrev7d: null,
      generatedAt: new Date().toISOString(),
      metrics: [],
    });
  }

  const d7 = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const d14 = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const d30 = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [entries, users, activeUsers30d, newUsers7d, newUsersPrev7d] = await Promise.all([
    countRows(sb, "stm_journal_entries"),
    distinctCount(sb, "stm_journal_entries", "auth_user_id"),
    distinctCount(sb, "stm_journal_entries", "auth_user_id", { gte: ["created_at", d30] }),
    distinctCount(sb, "stm_journal_entries", "auth_user_id", { gte: ["created_at", d7] }),
    distinctCount(sb, "stm_journal_entries", "auth_user_id", {
      gte: ["created_at", d14],
      lt: ["created_at", d7],
    }),
  ]);

  return NextResponse.json({
    ok: true,
    reporting: true,
    users,
    ticketsOpen: null,
    ordersRecent: null,
    activeUsers30d,
    newUsers7d,
    newUsersPrev7d,
    generatedAt: new Date().toISOString(),
    metrics: [
      { key: "entries", label: "Journal entries", value: entries },
      { key: "people", label: "People who journaled", value: users },
      { key: "recent", label: "Active in 30 days", value: activeUsers30d },
    ],
  });
}
