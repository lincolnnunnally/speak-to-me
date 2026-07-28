/**
 * ChurchConnect interconnect — same content hub as Real Life Application / VOTD.
 * Do not re-implement verse generation; pull from the public homescreen feed.
 *
 * Env (optional):
 *   NEXT_PUBLIC_CHURCHCONNECT_API_URL=https://api.churchconnect.cloud
 */

const API =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CHURCHCONNECT_API_URL) ||
  "https://api.churchconnect.cloud";

const DEVICE_KEY = "stm_verse_device_id";

export type HomescreenVerse = {
  date_key?: string;
  reference?: string;
  bsb_text?: string;
  real_life_application?: string;
  title?: string;
  devotional_excerpt?: string;
};

export function churchConnectApiBase(): string {
  return API.replace(/\/$/, "");
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        crypto.randomUUID?.() ||
        `stm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

/** Today's verse + Real Life Application from ChurchConnect Content Hub */
export async function fetchHomescreenVerse(): Promise<HomescreenVerse | null> {
  try {
    const res = await fetch(
      `${churchConnectApiBase()}/api/public/homescreen-verse?surface=speak_to_me`,
      { next: { revalidate: 300 } as RequestInit["next"] }
    );
    if (!res.ok) return null;
    return (await res.json()) as HomescreenVerse;
  } catch {
    return null;
  }
}

/**
 * Privacy-safe topic signal for pastors (no journal body).
 * ChurchConnect aggregates only after enough distinct devices.
 */
export async function recordVerseEngagement(opts: {
  event?: "view" | "favor" | "journal_prompt" | "share" | "pray" | "need";
  reference?: string;
  topic?: string;
  church_id?: string;
  zip_prefix?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(
      `${churchConnectApiBase()}/api/public/verse-engagement`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surface: "speak_to_me",
          event: opts.event || "view",
          reference: opts.reference || "",
          topic: opts.topic,
          church_id: opts.church_id,
          zip_prefix: opts.zip_prefix,
          device_id: getDeviceId(),
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
