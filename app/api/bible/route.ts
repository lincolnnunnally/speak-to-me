import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Public-domain Scripture lookup.
 * Primary: bible-api.com (World English Bible, public domain, actively hosted).
 * Fallbacks: bible-api.com KJV, then dailybible.ca KJV.
 * Every upstream call is time-boxed so a slow/broken source can't hang the
 * serverless function. `ref` is percent-encoded into fixed hosts (no SSRF).
 */

const TIMEOUT_MS = 6000;

async function fetchJson(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { "User-Agent": "SpeakToMeApp/1.0 (+life-produces-life)" },
      signal: controller.signal,
      next: { revalidate: 86400 }, // cache a day
    });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeBibleApi(data: {
  reference?: string;
  text?: string;
  verses?: { text?: string }[];
  translation_name?: string;
  translation_id?: string;
}, ref: string) {
  const text =
    (data.text && data.text.trim()) ||
    (Array.isArray(data.verses)
      ? data.verses.map((v) => v.text || "").join(" ").trim()
      : "");
  return {
    reference: data.reference || ref,
    text,
    translation: data.translation_name || data.translation_id?.toUpperCase() || "WEB",
    attribution: "Public Domain",
  };
}

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }
  const encoded = encodeURIComponent(ref.trim());

  // 1) bible-api.com (WEB)
  try {
    const res = await fetchJson(`https://bible-api.com/${encoded}`);
    if (res.ok) {
      const data = await res.json();
      const out = normalizeBibleApi(data, ref);
      if (out.text) return NextResponse.json(out);
    }
  } catch {
    /* fall through */
  }

  // 2) bible-api.com (KJV)
  try {
    const res = await fetchJson(`https://bible-api.com/${encoded}?translation=kjv`);
    if (res.ok) {
      const data = await res.json();
      const out = normalizeBibleApi(data, ref);
      if (out.text) return NextResponse.json({ ...out, translation: "KJV" });
    }
  } catch {
    /* fall through */
  }

  // 3) dailybible.ca (KJV)
  try {
    const res = await fetchJson(`https://dailybible.ca/api/${encoded}?translation=kjv`);
    if (res.ok) {
      const data = await res.json();
      const text =
        data.text ||
        (Array.isArray(data.verses)
          ? data.verses.map((v: { text?: string }) => v.text || "").join(" ")
          : "");
      if (text && String(text).trim()) {
        return NextResponse.json({
          reference: data.reference || ref,
          text: String(text).trim(),
          translation: "KJV",
          attribution: "Public Domain",
        });
      }
    }
  } catch {
    /* fall through */
  }

  return NextResponse.json(
    {
      error:
        'Could not find that passage. Try a simple reference like "John 3:16" or "Psalm 23".',
    },
    { status: 404 }
  );
}
