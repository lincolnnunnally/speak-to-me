import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    // Use bible49.com - free public domain (WEB / BSB)
    const url = `https://bible49.com/api/bible?ref=${encodeURIComponent(ref)}&t=web`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpeakToMeApp/1.0",
      },
      next: { revalidate: 86400 }, // cache a day
    });

    if (!res.ok) {
      // fallback to another free source
      const fallbackUrl = `https://dailybible.ca/api/${encodeURIComponent(ref)}?translation=kjv`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: "Could not find that passage. Try a simple reference like \"John 3:16\" or \"Psalm 23\"." },
          { status: 404 }
        );
      }
      const data = await fallbackRes.json();
      return NextResponse.json({
        reference: data.reference || ref,
        text: data.text || (data.verses ? data.verses.map((v: any) => v.text).join(" ") : ""),
        translation: "KJV",
      });
    }

    const data = await res.json();

    // Normalize response
    const text =
      data.verses && Array.isArray(data.verses)
        ? data.verses.map((v: any) => v.text).join(" ")
        : data.text || "";

    return NextResponse.json({
      reference: data.reference || ref,
      text: text.trim(),
      translation: data.translation?.abbreviation || data.translation_id || "WEB",
      attribution: data.attribution || "Public Domain",
    });
  } catch (error) {
    console.error("Bible fetch error:", error);
    return NextResponse.json(
      { error: "Unable to load Scripture right now. Please try again." },
      { status: 500 }
    );
  }
}
