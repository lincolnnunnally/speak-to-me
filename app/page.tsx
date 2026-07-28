"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createSpeakClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchHomescreenVerse,
  recordVerseEngagement,
  type HomescreenVerse,
} from "@/lib/churchconnect";

type JournalEntry = {
  id: string;
  reference: string;
  excerpt: string;
  response: string;
  created_at: string;
};

const INVITATION_QUESTIONS = [
  "Where do I see myself in this story or statement today?",
  "What is God saying to me about how He sees me right now?",
  "Is there something He is inviting me to receive, release, or do?",
  "What would it look like to trust this today?",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const sb = createSpeakClient();

  // ---- auth ----
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // ---- app ----
  const [reference, setReference] = useState("");
  const [passage, setPassage] = useState<{
    reference: string;
    text: string;
    translation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  // ChurchConnect Content Hub — Verse of the Day + Real Life Application
  const [homescreen, setHomescreen] = useState<HomescreenVerse | null>(null);
  const [homescreenLoading, setHomescreenLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHomescreenLoading(true);
      const v = await fetchHomescreenVerse();
      if (!cancelled) {
        setHomescreen(v);
        setHomescreenLoading(false);
        if (v?.reference) {
          void recordVerseEngagement({
            event: "view",
            reference: v.reference,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sb) {
      setAuthChecked(true);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  const loadEntries = useCallback(async () => {
    if (!sb || !user) return;
    const { data } = await sb
      .from("stm_journal_entries")
      .select("id, reference, passage_excerpt, response, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setEntries(
      (data || []).map((r) => ({
        id: r.id,
        reference: r.reference,
        excerpt: r.passage_excerpt || "",
        response: r.response,
        created_at: r.created_at,
      }))
    );
  }, [sb, user]);

  useEffect(() => {
    if (user) loadEntries();
    else setEntries([]);
  }, [user, loadEntries]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) return;
    setAuthError("");
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName: name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAuthError(data.error || "Could not create your account.");
          return;
        }
      }
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        setAuthError(
          authMode === "signup"
            ? "Account created, but sign-in failed. Try signing in."
            : "That email and password did not match. Try again."
        );
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (!sb) return;
    await sb.auth.signOut();
    setShowJournal(false);
    setPassage(null);
  };

  const loadPassage = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setPassage(null);
    setJournalText("");
    setSavedMessage(false);
    try {
      const res = await fetch(`/api/bible?ref=${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load that passage.");
        return;
      }
      setPassage({
        reference: data.reference,
        text: data.text,
        translation: data.translation,
      });
      // Anonymized signal only — never send journal text to ChurchConnect
      void recordVerseEngagement({
        event: "view",
        reference: data.reference,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openTodaysVerse = () => {
    if (!homescreen?.reference) return;
    setReference(homescreen.reference);
    // Prefer ChurchConnect BSB + RLT when present; still allow full passage load
    if (homescreen.bsb_text) {
      setPassage({
        reference: homescreen.reference,
        text: homescreen.bsb_text,
        translation: "BSB · ChurchConnect",
      });
      setJournalText("");
      setSavedMessage(false);
      setError("");
      void recordVerseEngagement({
        event: "view",
        reference: homescreen.reference,
      });
    } else {
      loadPassage(homescreen.reference);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPassage(reference);
  };

  const saveJournal = async () => {
    if (!sb || !user || !passage || !journalText.trim() || saving) return;
    setSaving(true);
    const excerpt =
      passage.text.slice(0, 200) + (passage.text.length > 200 ? "…" : "");
    const { data, error: insertError } = await sb
      .from("stm_journal_entries")
      .insert({
        auth_user_id: user.id,
        reference: passage.reference,
        passage_excerpt: excerpt,
        translation: passage.translation,
        response: journalText.trim(),
      })
      .select("id, reference, passage_excerpt, response, created_at")
      .single();

    setSaving(false);
    if (insertError || !data) {
      setError("Could not save your response. Please try again.");
      return;
    }

    setEntries((prev) => [
      {
        id: data.id,
        reference: data.reference,
        excerpt: data.passage_excerpt || "",
        response: data.response,
        created_at: data.created_at,
      },
      ...prev,
    ]);
    setJournalText("");
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);

    // Topic-only signal for area pastors (no journal body)
    void recordVerseEngagement({
      event: "journal_prompt",
      reference: passage.reference,
      topic: "reflection",
    });

    // Best-effort: contribute to the shared UUG growth journey.
    fetch("/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        displayName: (user.user_metadata as { display_name?: string })?.display_name,
        eventType: "check_in",
        title: `Reflected on ${passage.reference}`,
        detail: "Received Scripture as a living word and responded.",
      }),
    }).catch(() => {});
  };

  const deleteEntry = async (id: string) => {
    if (!sb) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await sb.from("stm_journal_entries").delete().eq("id", id);
  };

  // ---- render: not configured ----
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-5">
        <p className="text-soft text-center max-w-sm">
          This quiet space isn&apos;t connected yet. Please try again shortly.
        </p>
      </main>
    );
  }

  // ---- render: loading auth ----
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-cream text-ink flex items-center justify-center">
        <p className="text-soft">…</p>
      </main>
    );
  }

  // ---- render: signed out (auth gate) ----
  if (!user) {
    return (
      <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif tracking-tight">Speak to Me</h1>
            <p className="text-soft mt-2 leading-relaxed">
              A quiet place to hear Scripture as a living word from God — not a
              textbook.
            </p>
          </div>
          <form
            onSubmit={handleAuth}
            className="bg-card rounded-2xl p-6 shadow-sm border border-black/5 space-y-3"
          >
            {authMode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {authError && <p className="text-sm text-red-700">{authError}</p>}
            <button
              type="submit"
              disabled={authBusy}
              className="w-full px-5 py-3 bg-ink text-cream rounded-xl font-medium disabled:opacity-40 active:scale-95 transition"
            >
              {authBusy
                ? "…"
                : authMode === "signup"
                ? "Create account"
                : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm text-soft mt-4">
            {authMode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => {
                setAuthMode(authMode === "signup" ? "signin" : "signup");
                setAuthError("");
              }}
              className="text-accent hover:underline underline-offset-2"
            >
              {authMode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
          <p className="text-center text-xs text-soft/70 mt-6">
            Your account works across the whole Life Produces Life family.
          </p>
          {/* Today from ChurchConnect — available even before sign-in */}
          {!homescreenLoading && homescreen?.reference && (
            <div className="mt-8 rounded-2xl border border-black/5 bg-card p-4 text-left shadow-sm">
              <p className="text-xs uppercase tracking-wide text-accent mb-1">
                Today · ChurchConnect
              </p>
              <p className="font-serif text-lg text-ink">{homescreen.reference}</p>
              {homescreen.bsb_text && (
                <p className="text-sm text-soft mt-2 line-clamp-3 leading-relaxed">
                  {homescreen.bsb_text}
                </p>
              )}
              {homescreen.real_life_application && (
                <p className="text-xs text-ink/70 mt-2 italic line-clamp-2">
                  Real life: {homescreen.real_life_application}
                </p>
              )}
              <p className="text-[11px] text-soft/70 mt-3">
                Sign in to journal. Pastors may see anonymized area themes only — never your words.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ---- render: signed in (app) ----
  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Speak to Me</h1>
            <p className="text-soft text-sm mt-1">A living word, not a textbook</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowJournal(!showJournal)}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              {showJournal ? "Back" : `Journal (${entries.length})`}
            </button>
            <button
              onClick={signOut}
              className="text-sm text-soft underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pb-20">
        {!showJournal && !passage && !homescreenLoading && homescreen?.reference && (
          <button
            type="button"
            onClick={openTodaysVerse}
            className="w-full text-left mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-5 hover:bg-accent/10 transition"
          >
            <p className="text-xs uppercase tracking-wide text-accent mb-1">
              Today&apos;s verse · Real Life Application
            </p>
            <p className="font-serif text-xl text-ink">{homescreen.reference}</p>
            {homescreen.bsb_text && (
              <p className="text-sm text-soft mt-2 line-clamp-4 leading-relaxed">
                {homescreen.bsb_text}
              </p>
            )}
            {homescreen.real_life_application && (
              <p className="text-sm text-ink/80 mt-3 italic line-clamp-3">
                {homescreen.real_life_application}
              </p>
            )}
            <p className="text-xs text-accent mt-3 font-medium">Tap to receive this passage →</p>
          </button>
        )}

        {showJournal ? (
          <div className="space-y-4 mt-4">
            <h2 className="text-lg font-medium mb-4">Your responses</h2>
            {entries.length === 0 ? (
              <p className="text-soft text-center py-12">
                No entries yet. When you respond to a passage, it will appear here.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-card rounded-2xl p-5 shadow-sm border border-black/5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-accent">
                      {entry.reference}
                    </span>
                    <span className="text-xs text-soft">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  {entry.excerpt && (
                    <p className="text-sm text-soft mb-3 line-clamp-2 italic">
                      &ldquo;{entry.excerpt}&rdquo;
                    </p>
                  )}
                  <p className="text-ink leading-relaxed">{entry.response}</p>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="mt-3 text-xs text-soft hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-2 mb-8">
              <label className="block text-sm text-soft mb-2">Enter a passage</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="John 3:16 or Psalm 23"
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 text-base"
                />
                <button
                  type="submit"
                  disabled={loading || !reference.trim()}
                  className="px-5 py-3 bg-ink text-cream rounded-xl font-medium disabled:opacity-40 active:scale-95 transition"
                >
                  {loading ? "…" : "Open"}
                </button>
              </div>
              <p className="text-xs text-soft mt-2">
                Try: Romans 8:1 · Matthew 11:28-30 · Psalm 46:10 · Isaiah 41:10
              </p>
            </form>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-16 text-soft">
                <p>Loading the word…</p>
              </div>
            )}

            {passage && !loading && (
              <div className="space-y-8">
                <section className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
                  <div className="flex justify-between items-baseline mb-4">
                    <h2 className="text-lg font-medium text-accent">
                      {passage.reference}
                    </h2>
                    <span className="text-xs text-soft uppercase tracking-wide">
                      {passage.translation}
                    </span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-ink whitespace-pre-wrap">
                    {passage.text}
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-soft uppercase tracking-wider mb-4">
                    Quiet questions
                  </h3>
                  <ul className="space-y-3">
                    {INVITATION_QUESTIONS.map((q, i) => (
                      <li
                        key={i}
                        className="bg-white/70 rounded-xl px-4 py-3 text-ink leading-snug border border-black/5"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-soft uppercase tracking-wider mb-3">
                    Your response
                  </h3>
                  <p className="text-sm text-soft mb-3">
                    Write one honest sentence as if you are answering Him.
                  </p>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Lord, today I hear You saying…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 text-base resize-none"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={saveJournal}
                      disabled={!journalText.trim() || saving}
                      className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-40 active:scale-95 transition"
                    >
                      {saving ? "Saving…" : "Save response"}
                    </button>
                    {savedMessage && (
                      <span className="text-sm text-green-700">
                        Saved to your journal
                      </span>
                    )}
                  </div>
                </section>
              </div>
            )}

            {!passage && !loading && !error && (
              <div className="mt-12 text-center">
                <p className="text-soft leading-relaxed max-w-sm mx-auto">
                  This is not a study tool.
                  <br />
                  It is a quiet place to hear the Bible as a personal word from a
                  living God.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
