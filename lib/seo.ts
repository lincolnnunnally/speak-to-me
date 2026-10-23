import type { Metadata } from "next";

/**
 * What search engines see. Every line describes something the app does today.
 * Journals are never public: they live behind sign-in on "/" and have no URL.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://speak-to-me.unitedundergod.org").replace(/\/$/, "");
export const SITE_NAME = "Speak to Me";

export type FeatureKey = "daily-verse" | "read" | "quiet-questions" | "private-journal";

export type Feature = {
  key: FeatureKey;
  path: string;
  name: string;
  title: string;
  description: string;
};

export const FEATURES: Record<FeatureKey, Feature> = {
  "daily-verse": {
    key: "daily-verse",
    path: "/daily-verse",
    name: "Today's verse",
    title: "Today's Bible verse and real-life application | Speak to Me",
    description:
      "A Bible verse for today in the Berean Standard Bible, with a short real-life application. Open it and receive it as a living word, one day at a time.",
  },
  read: {
    key: "read",
    path: "/read",
    name: "Read any passage",
    title: "Read any Bible passage on a quiet page | Speak to Me",
    description:
      "Type a reference like John 3:16 or Psalm 23 and read the passage on a clean page in the public-domain World English Bible, with King James as a fallback.",
  },
  "quiet-questions": {
    key: "quiet-questions",
    path: "/quiet-questions",
    name: "Quiet questions",
    title: "Devotional questions for hearing God | Speak to Me",
    description:
      "Four quiet, relational questions to sit with after you read: not study questions, but an invitation to hear what God is saying to you today.",
  },
  "private-journal": {
    key: "private-journal",
    path: "/private-journal",
    name: "Private journal",
    title: "A private Bible journal for your response | Speak to Me",
    description:
      "Write one honest sentence back to God after each passage. Your journal stays in your account; pastors never see your words, only anonymous reading signals.",
  },
};

export const FEATURE_ORDER: FeatureKey[] = ["daily-verse", "read", "quiet-questions", "private-journal"];

export const HOME = {
  title: "Speak to Me — hear Scripture as a living word, daily",
  description:
    "A quiet Bible reading app: today's verse, any passage you choose, four gentle questions and a private journal. Scripture as a living word, not a textbook.",
};

export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, url, title, description, locale: "en_US" },
    twitter: { card: "summary", title, description },
  };
}

export function featureMetadata(key: FeatureKey): Metadata {
  const f = FEATURES[key];
  return pageMetadata(f.path, f.title, f.description);
}

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
};

export const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#app`,
  name: SITE_NAME,
  url: SITE_URL,
  description: HOME.description,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web browser",
  publisher: { "@id": `${SITE_URL}/#organization` },
  featureList: FEATURE_ORDER.map((k) => FEATURES[k].name),
};

export function featureJsonLd(key: FeatureKey) {
  const f = FEATURES[key];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: f.name,
    description: f.description,
    url: absoluteUrl(f.path),
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}
