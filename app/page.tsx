"use client";

import { useState, useEffect } from "react";

type JournalEntry = {
  id: string;
  reference: string;
  text: string;
  response: string;
  date: string;
};

const INVITATION_QUESTIONS = [
  "Where do I see myself in this story or statement today?",
  "What is God saying to me about how He sees me right now?",
  "Is there something He is inviting me to receive, release, or do?",
  "What would it look like to trust this today?",
];

export default function Home() {
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

  // Load saved journals
  useEffect(() => {
    const saved = localStorage.getItem("speak-to-me-journals");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("speak-to-me-journals", JSON.stringify(newEntries));
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPassage(reference);
  };

  const saveJournal = () => {
    if (!passage || !journalText.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      reference: passage.reference,
      text: passage.text.slice(0, 200) + (passage.text.length > 200 ? "..." : ""),
      response: journalText.trim(),
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveEntries(updated);
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Speak to Me</h1>
            <p className="text-soft text-sm mt-1">A living word, not a textbook</p>
          </div>
          <button
            onClick={() => setShowJournal(!showJournal)}
            className="text-sm text-accent underline-offset-2 hover:underline"
          >
            {showJournal ? "Back" : `Journal (${entries.length})`}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pb-20">
        {showJournal ? (
          /* Journal List View */
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
                    <span className="text-sm font-medium text-accent">{entry.reference}</span>
                    <span className="text-xs text-soft">{entry.date}</span>
                  </div>
                  <p className="text-sm text-soft mb-3 line-clamp-2 italic">"{entry.text}"</p>
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
          /* Main Speak to Me flow */
          <>
            {/* Input */}
            <form onSubmit={handleSubmit} className="mt-2 mb-8">
              <label className="block text-sm text-soft mb-2">
                Enter a passage
              </label>
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
                  {loading ? "..." : "Open"}
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
                <p>Loading the word...</p>
              </div>
            )}

            {passage && !loading && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Scripture */}
                <section className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
                  <div className="flex justify-between items-baseline mb-4">
                    <h2 className="text-lg font-medium text-accent">{passage.reference}</h2>
                    <span className="text-xs text-soft uppercase tracking-wide">{passage.translation}</span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-ink whitespace-pre-wrap">
                    {passage.text}
                  </p>
                </section>

                {/* Invitation Questions */}
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

                {/* Journal */}
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
                    placeholder="Lord, today I hear You saying..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 text-base resize-none"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={saveJournal}
                      disabled={!journalText.trim()}
                      className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-40 active:scale-95 transition"
                    >
                      Save response
                    </button>
                    {savedMessage && (
                      <span className="text-sm text-green-700">Saved to your journal</span>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Empty state encouragement */}
            {!passage && !loading && !error && (
              <div className="mt-12 text-center">
                <p className="text-soft leading-relaxed max-w-sm mx-auto">
                  This is not a study tool.<br />
                  It is a quiet place to hear the Bible as a personal word from a living God.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
